import { apiClient } from './client';
export const authApi = {
    getMe: () => apiClient.get('/api/auth/me'),
    logout: () => apiClient.post('/api/auth/logout', {}),
};
