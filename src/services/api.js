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
    getProfile: async () => {
        const response = await api.get('/auth/me');
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

export const contentService = {
    generateImage: async (prompt, model, projectId) => {
        const response = await api.post('/images/generate', { prompt, model, projectId });
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
};

export const chatService = {
    sendMessage: async (message, chatId, projectId) => {
        const response = await api.post('/chat/send', { message, chatId, projectId });
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

export default api;
