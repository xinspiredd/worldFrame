// frontend/admin.js
window.App = (function() {
    let currentUser = null;

    async function init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await api.getCurrentUser();
                currentUser = data.user;
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        updateUI();
    }

    function updateUI() {
        const userBar = document.getElementById('userBar');
        if (!userBar) return;

        if (currentUser) {
            userBar.innerHTML = `
                <span style="color:#8cc9ff;">${currentUser.login}</span> | 
                <a onclick="App.logout()">Выйти</a>
            `;
        } else {
            userBar.innerHTML = `
                <a onclick="App.openAuthModal('login')">Войти</a> | 
                <a onclick="App.openAuthModal('register')">Регистрация</a>
            `;
        }

        const adminPanel = document.getElementById('adminPhotoPanel');
        if (adminPanel) {
            if (currentUser?.isAdmin) {
                adminPanel.classList.remove('hidden');
            } else {
                adminPanel.classList.add('hidden');
            }
        }
    }

    async function register(login, password, adminKey) {
        try {
            const data = await api.register(login, password, adminKey);
            api.setToken(data.token);
            currentUser = data.user;
            updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async function login(login, password) {
        try {
            const data = await api.login(login, password);
            api.setToken(data.token);
            currentUser = data.user;
            updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    function logout() {
        api.setToken(null);
        currentUser = null;
        updateUI();
        window.location.reload();
    }

    function getCurrentUser() {
        return currentUser;
    }

    function isAdmin() {
        return currentUser?.isAdmin || false;
    }

    let authModal, authTitle, authToggle, adminKeyField, authMode = 'login';

    function initModal() {
        authModal = document.getElementById('authModal');
        authTitle = document.getElementById('authTitle');
        authToggle = document.getElementById('authToggle');
        adminKeyField = document.getElementById('adminKeyField');
    }

    function openAuthModal(mode) {
        if (!authModal) initModal();
        authMode = mode;
        authTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
        authToggle.textContent = mode === 'login' ? 'Регистрация' : 'Вход';
        adminKeyField.style.display = mode === 'register' ? 'block' : 'none';
        authModal.classList.add('active');
    }

    function closeAuthModal() {
        if (authModal) authModal.classList.remove('active');
    }

    function toggleAuthMode() {
        authMode = authMode === 'login' ? 'register' : 'login';
        authTitle.textContent = authMode === 'login' ? 'Вход' : 'Регистрация';
        authToggle.textContent = authMode === 'login' ? 'Регистрация' : 'Вход';
        adminKeyField.style.display = authMode === 'register' ? 'block' : 'none';
    }

    async function submitAuth() {
        const loginInput = document.getElementById('authLogin');
        const passwordInput = document.getElementById('authPassword');
        const login = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!login || !password) {
            alert('Заполните логин и пароль');
            return;
        }

        let result;
        if (authMode === 'register') {
            const adminKeyInput = document.getElementById('authAdminKey');
            const key = adminKeyInput.value.trim();
            result = await register(login, password, key);
        } else {
            result = await login(login, password);
        }

        if (result.success) {
            alert(authMode === 'register' ? 'Регистрация успешна!' : 'Вход выполнен');
            closeAuthModal();
        } else {
            alert(result.message);
        }
    }

    return {
        init,
        getCurrentUser,
        isAdmin,
        openAuthModal,
        closeAuthModal,
        toggleAuthMode,
        submitAuth,
        logout
    };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
