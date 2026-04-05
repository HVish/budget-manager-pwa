import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Budget, BudgetCreate, BudgetUpdate, BudgetSummaryResponse } from '@/api/types';
import { getClientTimezone } from '@/lib/date';

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: () => api.get('api/v1/budgets').json<Budget[]>(),
  });
}

export function useBudget(budgetId: string) {
  return useQuery({
    queryKey: ['budgets', budgetId],
    queryFn: () => api.get(`api/v1/budgets/${budgetId}`).json<Budget>(),
    enabled: !!budgetId,
  });
}

export function useBudgetSummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['budgets', 'summary', { year, month }],
    queryFn: () => {
      const searchParams: Record<string, string | number> = {
        timezone: getClientTimezone(),
      };
      if (year !== undefined) searchParams.year = year;
      if (month !== undefined) searchParams.month = month;
      return api.get('api/v1/budgets/summary', { searchParams }).json<BudgetSummaryResponse>();
    },
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetCreate) => api.post('api/v1/budgets', { json: data }).json<Budget>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateBudget(budgetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetUpdate) =>
      api.patch(`api/v1/budgets/${budgetId}`, { json: data }).json<Budget>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budgetId: string) => api.delete(`api/v1/budgets/${budgetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
