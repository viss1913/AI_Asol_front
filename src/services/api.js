import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
});

/** Turn relative upload paths into a URL the browser can load (dev proxy / prod origin). */
function toAbsoluteAssetUrl(url) {
    if (!url || typeof url !== 'string') return url;
    if (/^https?:\/\//i.test(url) || url.startsWith('blob:')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    const path = url.startsWith('/') ? url : `/${url}`;
    if (!base || base.startsWith('/')) return path;
    try {
        return new URL(path, new URL(base).origin).href;
    } catch {
        return path;
    }
}

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
    getTransactions: async () => {
        const response = await api.get('/auth/transactions');
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
    downloadFile: async (taskId) => {
        const response = await api.get(`/history/${taskId}/download`, {
            responseType: 'blob',
        });
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
        // Do not set Content-Type — browser must add multipart boundary
        const response = await api.post('/upload', formData);
        const raw = response.data || {};
        const url =
            raw.url ??
            raw.fileUrl ??
            (raw.data && (typeof raw.data === 'string' ? raw.data : raw.data.url));
        if (!url) {
            const msg = raw.error || raw.message || 'Сервер не вернул ссылку на файл';
            throw new Error(msg);
        }
        return { ...raw, url: toAbsoluteAssetUrl(url) };
    },
    fetchAssets: async (type = null) => {
        const params = type ? { type } : {};
        const response = await api.get('/assets', { params });
        return response.data;
    },
    fetchVisuals: async () => {
        const response = await api.get('/assets/visuals');
        return response.data;
    },
    fetchHistory: async () => {
        const response = await api.get('/assets/all');
        return response.data;
    },
    deleteAsset: async (id) => {
        const response = await api.delete(`/assets/${id}`);
        return response.data;
    },
};

export const chatService = {
    sendMessage: async (message, chatId, projectId, model, file) => {
        const formData = new FormData();
        formData.append('message', message || '');
        if (chatId) formData.append('chatId', chatId);
        if (projectId) formData.append('projectId', projectId);
        if (model) formData.append('model', model);
        if (file) formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await fetch(`${api.defaults.baseURL}/chat/send`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { response: { status: response.status, data: errorData } };
        }

        return await response.json();
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
    getHistory: async () => {
        const response = await api.get('/payments/history');
        return response.data;
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

export const presentationService = {
    list: async () => {
        const response = await api.get('/presentations');
        return response.data;
    },
    create: async (data = {}) => {
        const response = await api.post('/presentations', data);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/presentations/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/presentations/${id}`, data);
        return response.data;
    },
    updateSlides: async (id, slides) => {
        const response = await api.put(`/presentations/${id}/slides`, { slides });
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/presentations/${id}`);
        return response.data;
    },
    sendChat: async (id, message, files = []) => {
        if (files?.length) {
            const formData = new FormData();
            formData.append('message', message || '');
            files.forEach((file) => formData.append('files', file));
            const token = localStorage.getItem('token');
            const response = await fetch(`${api.defaults.baseURL}/presentations/${id}/chat`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw { response: { status: response.status, data: err } };
            }
            return response.json();
        }
        const response = await api.post(`/presentations/${id}/chat`, { message });
        return response.data;
    },
    generate: async (id) => {
        const response = await api.post(`/presentations/${id}/generate`);
        return response.data;
    },
    getStatus: async (id) => {
        const response = await api.get(`/presentations/${id}/status`);
        return response.data;
    },
    estimateCost: async (id) => {
        const response = await api.get(`/presentations/${id}/estimate`);
        return response.data;
    },
    exportPdf: async (id) => {
        const response = await api.post(`/presentations/${id}/export-pdf`);
        return response.data;
    },
};

export default api;
