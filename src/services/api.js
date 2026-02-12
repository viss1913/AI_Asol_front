import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://video-studio-ai-asol-back-production.up.railway.app/api/v1',
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
        // if (response.data.token) localStorage.setItem('token', response.data.token);
        return response.data;
    },
    verifyEmail: async (email, code) => {
        const response = await api.post('/auth/verify-email', { email, code });
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
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    },
};

export const projectService = {
    create: async (projectData) => {
        const response = await api.post('/projects', projectData);
        return response.data;
    },
    list: async () => {
        const response = await api.get('/projects');
        return response.data;
    },
    getDetails: async (projectId) => {
        const response = await api.get(`/projects/${projectId}`);
        return response.data;
    },
};

export const historyService = {
    getTaskStatus: async (taskId) => {
        const response = await api.get(`/history/${taskId}`);
        return response.data;
    },
};

export const contentService = {
    generateImage: async (imageData) => {
        const response = await api.post('/images/generate', imageData);
        return response.data;
    },
    editImage: async (prompt, model, imageUrl, projectId) => {
        const response = await api.post('/images/generate', { prompt, model, image_url: imageUrl, projectId });
        return response.data;
    },
    generateVideo: async (videoData) => {
        const response = await api.post('/videos/generate', videoData);
        return response.data;
    },
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    fetchAssets: async (type = null) => {
        const params = type ? { type } : {};
        const response = await api.get('/assets', { params });
        return response.data;
    },
};

export const chatService = {
    sendMessage: async (message, chatId, projectId, model) => {
        const response = await api.post('/chat/send', { message, chatId, projectId, model });
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
    deleteChat: async (chatId) => {
        const response = await api.delete(`/chat/${chatId}`);
        return response.data;
    },
};

export const paymentService = {
    initPayment: async (amount) => {
        const response = await api.post('/payments/init', { amount });
        return response.data; // { paymentUrl, paymentId }
    },
};

export const audioService = {
    getVoices: async () => {
        const response = await api.get('/audio/voices');
        return response.data;
    },
    generateAudio: async (audioData) => {
        const response = await api.post('/audio/elevenlabs', audioData);
        return response.data;
    },
};

export const configService = {
    calculateCost: async (model, options = {}) => {
        const response = await api.post('/config/calculate', { model, options });
        return response.data; // { cost: 630 }
    },
};

export default api;
