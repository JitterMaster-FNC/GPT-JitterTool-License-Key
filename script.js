const CLIENT_ID = '1409857262830227566';
const REDIRECT_URI = 'https://gpt-jittertool-license-key.pages.dev';

const loginView = document.getElementById('login-view');
const keyView = document.getElementById('key-view');
const errorView = document.getElementById('error-view');
const licenseKeyDisplay = document.getElementById('license-key');
const errorMessage = document.getElementById('error-message');
const btnLogin = document.getElementById('btn-discord-login');
const btnCopy = document.getElementById('btn-copy');

btnLogin.addEventListener('click', () => {
    const scope = encodeURIComponent('identify guilds');
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
});

btnCopy.addEventListener('click', () => {
    const keyText = licenseKeyDisplay.innerText;
    navigator.clipboard.writeText(keyText).then(() => {
        btnCopy.innerText = 'クリップボードにコピーしました / Copied to clipboard';
        setTimeout(() => {
            btnCopy.innerText = 'クリップボードにコピー / Copy to Clipboard';
        }, 2000);
    });
});

window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        window.history.replaceState({}, document.title, "/");
        loginView.classList.add('hidden');
        keyView.classList.remove('hidden');
        licenseKeyDisplay.innerText = '認証中... / Authenticating…';

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (response.ok) {
                licenseKeyDisplay.innerText = data.key;
            } else {
                showError(data.error || 'エラーが発生しました。');
            }
        } catch (e) {
            showError('サーバーとの通信に失敗しました。');
        }
    }
});

function showError(msg) {
    loginView.classList.add('hidden');
    keyView.classList.add('hidden');
    errorView.classList.remove('hidden');
    errorMessage.innerText = msg;
}
