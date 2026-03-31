import { unwrapData } from '@/shared/api/service.utils.js';
import { api } from '@/shared/lib/apiClient.js';


export const authService = {
    login: async (credentials) => {
        return unwrapData(await api.post('/auth/login', credentials));
    },

    register: async (data) => {
        return unwrapData(await api.post('/auth/register', data));
    },

    refresh: async () => {
        return unwrapData(await api.post('/auth/refresh'));
    },

    logout: async () => {
        return unwrapData(await api.post('/auth/logout'));
    },
    
    me: async () => {
        return unwrapData(await api.get('/auth/me'));
    }
};