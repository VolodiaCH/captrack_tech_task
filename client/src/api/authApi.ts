import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  getMe: () => apiClient.get<User>('/api/auth/me'),
  logout: () => apiClient.post<{ message: string }>('/api/auth/logout', {}),
};
