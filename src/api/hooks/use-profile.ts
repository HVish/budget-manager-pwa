import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { UserProfile } from '@/api/types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('api/v1/users/profile').json<UserProfile>(),
    staleTime: 5 * 60 * 1000,
  });
}
