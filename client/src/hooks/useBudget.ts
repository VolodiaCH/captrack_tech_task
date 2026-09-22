import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';

export function useBudget(yearMonth: string) {
  return useQuery({
    queryKey: ['budget', yearMonth],
    queryFn: () => budgetsApi.getBudget(yearMonth),
  });
}

export function useCreateOrUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      yearMonth,
      data,
    }: {
      yearMonth: string;
      data: { amount: number; currency: string };
    }) => budgetsApi.createOrUpdateBudget(yearMonth, data),
    onSuccess: (_, { yearMonth }) => {
      queryClient.invalidateQueries({ queryKey: ['budget', yearMonth] });
    },
  });
}
