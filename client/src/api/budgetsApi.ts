import { apiClient } from './client';
import { Budget } from '../types';

export const budgetsApi = {
  getBudget: (yearMonth: string) =>
    apiClient.get<Budget>(`/api/budgets/${yearMonth}`),
  createOrUpdateBudget: (
    yearMonth: string,
    data: { amount: number; currency: string }
  ) => apiClient.put<Budget>(`/api/budgets/${yearMonth}`, data),
};
