// frontend/admin.js
window.App = (function() {
    let currentUser = null;

    async function init() {
        console.log('🔄 admin.js init started');
        if (typeof window.api === 'undefined') {
            console.error('❌ api не определён! Проверьте загрузку api.js');
            return;
        }
        const token = localStorage.getItem('token');
        if (token) {
            try {
                console.log('🔍 Проверка токена...');
                const data = await window.api.getCurrentUser();
                currentUser = data.user;
                console.log('👤 Текущий пользователь:', currentUser);
            } catch (error) {
                console.warn('⚠️ Ошибка получения пользователя:', error.message);
                localStorage.removeItem('token');
            }
        }
        updateUI();
        console.log('✅ admin.js init завершён');
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
            const data = await window.api.register(login, password, adminKey);
            window.api.setToken(data.token);
            currentUser = data.user;
            updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async function login(login, password) {
        try {
            const data = await window.api.login(login, password);
            window.api.setToken(data.token);
            currentUser = data.user;
            updateUI();
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    function logout() {
        window.api.setToken(null);
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
        const loginValue = loginInput.value.trim();
        const password = passwordInput.value.trim();

        if (!loginValue || !password) {
            alert('Заполните логин и пароль');
            return;
        }

        let result;
        if (authMode === 'register') {
            const adminKeyInput = document.getElementById('authAdminKey');
            const key = adminKeyInput.value.trim();
            result = await register(loginValue, password, key);
        } else {
            result = await login(loginValue, password);
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
