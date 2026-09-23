import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/categoriesApi';
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getCategories,
    });
}
export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: categoriesApi.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }) => categoriesApi.updateCategory(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: categoriesApi.deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
}
