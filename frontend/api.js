// frontend/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// ИЛИ для обычного JS (без Vite), используйте process.env:
// const API_URL = process.env.API_URL || 'http://localhost:5000/api';

class Api {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Ошибка запроса');
        }

        return data;
    }

    // Аутентификация
    async register(login, password, adminKey) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ login, password, adminKey })
        });
    }

    async login(login, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ login, password })
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Билды
    async getBuilds(carName) {
        return this.request(`/builds/${encodeURIComponent(carName)}`);
    }

    // ОБНОВЛЁН: теперь принимает все поля
    async createBuild(carName, title, price, engine, turbo, transmission, suspension, brakes, tires, details) {
        return this.request('/builds', {
            method: 'POST',
            body: JSON.stringify({
                carName,
                title,
                price,
                engine,
                turbo,
                transmission,
                suspension,
                brakes,
                tires,
                details
            })
        });
    }

    async likeBuild(buildId, type) {
        return this.request(`/builds/${buildId}/like`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    }

    async addBuildComment(buildId, text) {
        return this.request(`/builds/${buildId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }

    async deleteBuild(buildId) {
        return this.request(`/builds/${buildId}`, {
            method: 'DELETE'
        });
    }

    async deleteBuildComment(buildId, commentId) {
        return this.request(`/builds/${buildId}/comment/${commentId}`, {
            method: 'DELETE'
        });
    }

    // Винилы (без изменений)
    async getVinyls() {
        return this.request('/vinyls');
    }

    async getVinylsByCar(carName) {
        return this.request(`/vinyls/car/${encodeURIComponent(carName)}`);
    }

    async createVinyl(name, car, code, image) {
        return this.request('/vinyls', {
            method: 'POST',
            body: JSON.stringify({ name, car, code, image })
        });
    }

    async likeVinyl(vinylId, type) {
        return this.request(`/vinyls/${vinylId}/like`, {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    }

    async addVinylComment(vinylId, text) {
        return this.request(`/vinyls/${vinylId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ text })
        });
    }

    async deleteVinyl(vinylId) {
        return this.request(`/vinyls/${vinylId}`, {
            method: 'DELETE'
        });
    }

    async deleteVinylComment(vinylId, commentId) {
        return this.request(`/vinyls/${vinylId}/comment/${commentId}`, {
            method: 'DELETE'
        });
    }
}


window.api = new Api();
