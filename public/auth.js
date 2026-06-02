let authToken = localStorage.getItem('authToken');
let currentUser = localStorage.getItem('currentUser');

const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

// Check if already logged in
if (authToken) {
    loginScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    document.querySelector('.user-name').textContent = currentUser;
} else {
    loginScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

// Login Form Submit
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user.username;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', currentUser);
            document.querySelector('.user-name').textContent = currentUser;
            loginScreen.classList.add('hidden');
            appContainer.classList.remove('hidden');
            loadDashboard();
            loginForm.reset();
        } else {
            loginError.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        loginError.textContent = 'Connection error';
    }
});

// Logout
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    loginScreen.classList.remove('hidden');
    appContainer.classList.add('hidden');
    loginForm.reset();
    loginError.textContent = '';
});

// Helper: Get Authorization Header
function getAuthHeader() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}
