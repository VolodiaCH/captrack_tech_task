import { apiClient } from './client';
import { Category } from '../types';

export const categoriesApi = {
  getCategories: () => apiClient.get<Category[]>('/api/categories'),
  createCategory: (name: string) =>
    apiClient.post<Category>('/api/categories', { name }),
  updateCategory: (id: string, name: string) =>
    apiClient.put<Category>(`/api/categories/${id}`, { name }),
  deleteCategory: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/categories/${id}`),
};
