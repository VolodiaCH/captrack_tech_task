import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
export function useMe() {
    return useQuery({
        queryKey: ['me'],
        queryFn: () => authApi.getMe(),
        retry: false,
        staleTime: Infinity,
    });
}
