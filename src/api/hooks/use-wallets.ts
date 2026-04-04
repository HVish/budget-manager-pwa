import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  Wallet,
  WalletCreate,
  WalletUpdate,
  WalletType,
  BalanceHistoryEntry,
} from '@/api/types';

export function useWallets(type?: WalletType) {
  return useQuery({
    queryKey: ['wallets', { type }],
    queryFn: () =>
      api
        .get('api/v1/wallets', {
          searchParams: type ? { type } : {},
        })
        .json<Wallet[]>(),
  });
}

export function useWallet(walletId: string) {
  return useQuery({
    queryKey: ['wallets', walletId],
    queryFn: () => api.get(`api/v1/wallets/${walletId}`).json<Wallet>(),
    enabled: !!walletId,
  });
}

export function useWalletHistory(walletId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['wallets', walletId, 'history', { startDate, endDate }],
    queryFn: () =>
      api
        .get(`api/v1/wallets/${walletId}/history`, {
          searchParams: { startDate, endDate },
        })
        .json<BalanceHistoryEntry[]>(),
    enabled: !!walletId && !!startDate && !!endDate,
  });
}

/**
 * Fetch balance history for multiple wallets in parallel using a single
 * useQueries call. Shares the same query key pattern as useWalletHistory,
 * so the wallet detail page hits the cache when navigating from the list.
 */
export function useWalletHistories(walletIds: string[], startDate: string, endDate: string) {
  return useQueries({
    queries: walletIds.map((id) => ({
      queryKey: ['wallets', id, 'history', { startDate, endDate }],
      queryFn: () =>
        api
          .get(`api/v1/wallets/${id}/history`, {
            searchParams: { startDate, endDate },
          })
          .json<BalanceHistoryEntry[]>(),
      enabled: !!id && !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    })),
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletCreate) => api.post('api/v1/wallets', { json: data }).json<Wallet>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useUpdateWallet(walletId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WalletUpdate) =>
      api.patch(`api/v1/wallets/${walletId}`, { json: data }).json<Wallet>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (walletId: string) => api.delete(`api/v1/wallets/${walletId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
