import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';
export function useBudget(yearMonth) {
    return useQuery({
        queryKey: ['budget', yearMonth],
        queryFn: () => budgetsApi.getBudget(yearMonth),
    });
}
export function useCreateOrUpdateBudget() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ yearMonth, data, }) => budgetsApi.createOrUpdateBudget(yearMonth, data),
        onSuccess: (_, { yearMonth }) => {
            queryClient.invalidateQueries({ queryKey: ['budget', yearMonth] });
        },
    });
}
