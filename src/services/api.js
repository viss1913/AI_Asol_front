import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) localStorage.setItem('token', response.data.token);
        return response.data;
    },
    login: async (userData) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) localStorage.setItem('token', response.data.token);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
};

export const contentService = {
    generateImage: async (prompt, model) => {
        const response = await api.post('/images/generate', { prompt, model });
        return response.data;
    },
    editImage: async (prompt, model, imageUrl) => {
        const response = await api.post('/images/generate', { prompt, model, image_url: imageUrl });
        return response.data;
    },
};

export const chatService = {
    sendMessage: async (message, chatId) => {
        const response = await api.post('/chat/send', { message, chatId });
        return response.data;
    },
    getChats: async () => {
        const response = await api.get('/chat/list');
        return response.data;
    },
    getChatHistory: async (chatId) => {
        const response = await api.get(`/chat/history/${chatId}`);
        return response.data;
    },
};

export default api;
