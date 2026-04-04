import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { DashboardResponse } from '@/api/types';
import { getClientTimezone } from '@/lib/date';

export function useDashboard(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', { year, month }],
    queryFn: () =>
      api
        .get('api/v1/dashboard', {
          searchParams: { year, month, timezone: getClientTimezone() },
        })
        .json<DashboardResponse>(),
  });
}
