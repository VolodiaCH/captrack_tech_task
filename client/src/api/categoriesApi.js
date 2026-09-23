import { apiClient } from './client';
export const categoriesApi = {
    getCategories: () => apiClient.get('/api/categories'),
    createCategory: (name) => apiClient.post('/api/categories', { name }),
    updateCategory: (id, name) => apiClient.put(`/api/categories/${id}`, { name }),
    deleteCategory: (id) => apiClient.delete(`/api/categories/${id}`),
};
