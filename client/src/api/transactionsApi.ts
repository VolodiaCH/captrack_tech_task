import { apiClient } from './client';
import { Transaction, TransactionsResponse } from '../types';

export interface TransactionFilters {
  search?: string;
  categoryId?: string;
  dateRange?: 'thisMonth' | 'lastMonth' | 'custom';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export const transactionsApi = {
  getTransactions: (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.minAmount !== undefined)
        params.append('minAmount', String(filters.minAmount));
      if (filters.maxAmount !== undefined)
        params.append('maxAmount', String(filters.maxAmount));
      if (filters.page !== undefined) params.append('page', String(filters.page));
      if (filters.pageSize !== undefined)
        params.append('pageSize', String(filters.pageSize));
    }
    const queryString = params.toString();
    const path = queryString ? `/api/transactions?${queryString}` : '/api/transactions';
    return apiClient.get<TransactionsResponse>(path);
  },
  createTransaction: (data: {
    categoryId: string;
    title: string;
    amount: string;
    currency: string;
    date: string;
    notes?: string;
  }) => apiClient.post<Transaction>('/api/transactions', data),
  updateTransaction: (
    id: string,
    data: {
      categoryId?: string;
      title?: string;
      amount?: string;
      currency?: string;
      date?: string;
      notes?: string;
    }
  ) => apiClient.put<Transaction>(`/api/transactions/${id}`, data),
  deleteTransaction: (id: string) =>
    apiClient.delete<{ message: string }>(`/api/transactions/${id}`),
};
