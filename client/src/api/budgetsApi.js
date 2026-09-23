import { apiClient } from './client';
export const budgetsApi = {
    getBudget: (yearMonth) => apiClient.get(`/api/budgets/${yearMonth}`),
    createOrUpdateBudget: (yearMonth, data) => apiClient.put(`/api/budgets/${yearMonth}`, data),
};
