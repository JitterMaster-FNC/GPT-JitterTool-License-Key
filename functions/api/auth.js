export async function onRequestPost(context) {
    const { request, env } = context;
    const { code } = await request.json();

    if (!code) {
        return new Response(JSON.stringify({ error: 'No code provided' }), { status: 400 });
    }

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: env.DISCORD_CLIENT_ID,
                client_secret: env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: env.REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            return new Response(JSON.stringify({ error: 'Failed to exchange code' }), { status: 401 });
        }

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        const userData = await userResponse.json();

        const memberResponse = await fetch(`https://discord.com/api/guilds/${env.DISCORD_GUILD_ID}/members/${userData.id}`, {
            headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
        });

        if (memberResponse.status === 404) {
            return new Response(JSON.stringify({ error: 'Discordサーバーに参加していません。参加してから再度お試しください。' }), { status: 403 });
        }

        const gasResponse = await fetch(env.GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: 'discord_assign',
                discordId: userData.id,
                discordName: userData.username
            })
        });

        const key = await gasResponse.text();

        if (key.startsWith('Error:')) {
            return new Response(JSON.stringify({ error: key }), { status: 500 });
        }

        return new Response(JSON.stringify({ key: key }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
