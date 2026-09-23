import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, } from '../api/transactionsApi';
export function useTransactions(filters) {
    return useQuery({
        queryKey: ['transactions', filters || {}],
        queryFn: () => transactionsApi.getTransactions(filters),
    });
}
export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: transactionsApi.createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}
export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data, }) => transactionsApi.updateTransaction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}
export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: transactionsApi.deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });
}
