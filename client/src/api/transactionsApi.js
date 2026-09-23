import { apiClient } from './client';
export const transactionsApi = {
    getTransactions: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.search)
                params.append('search', filters.search);
            if (filters.categoryId)
                params.append('categoryId', filters.categoryId);
            if (filters.dateRange)
                params.append('dateRange', filters.dateRange);
            if (filters.startDate)
                params.append('startDate', filters.startDate);
            if (filters.endDate)
                params.append('endDate', filters.endDate);
            if (filters.minAmount !== undefined)
                params.append('minAmount', String(filters.minAmount));
            if (filters.maxAmount !== undefined)
                params.append('maxAmount', String(filters.maxAmount));
            if (filters.page !== undefined)
                params.append('page', String(filters.page));
            if (filters.pageSize !== undefined)
                params.append('pageSize', String(filters.pageSize));
        }
        const queryString = params.toString();
        const path = queryString ? `/api/transactions?${queryString}` : '/api/transactions';
        return apiClient.get(path);
    },
    createTransaction: (data) => apiClient.post('/api/transactions', data),
    updateTransaction: (id, data) => apiClient.put(`/api/transactions/${id}`, data),
    deleteTransaction: (id) => apiClient.delete(`/api/transactions/${id}`),
};
