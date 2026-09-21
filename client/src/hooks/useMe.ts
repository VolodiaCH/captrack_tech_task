import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { User } from '../types';

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => authApi.getMe(),
    retry: false,
    staleTime: Infinity,
  });
}
