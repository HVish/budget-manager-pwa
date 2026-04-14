import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type {
  TransactionListResponse,
  TransactionCreate,
  TransactionUpdate,
  Transaction,
  TransferCreate,
  Transfer,
} from '@/api/types';

interface TransactionFilters {
  walletIds?: string[];
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: string;
  tags?: string[];
  isTransfer?: boolean;
  limit?: number;
}

export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: ['transactions', transactionId],
    queryFn: () => api.get(`api/v1/transactions/${transactionId}`).json<Transaction>(),
    enabled: !!transactionId,
  });
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam }) => {
      const searchParams: Record<string, string | number | boolean> = {};

      if (filters.walletIds?.length) searchParams.walletIds = filters.walletIds.join(',');
      if (filters.startDate) searchParams.startDate = filters.startDate;
      if (filters.endDate) searchParams.endDate = filters.endDate;
      if (filters.minAmount !== undefined) searchParams.minAmount = filters.minAmount;
      if (filters.maxAmount !== undefined) searchParams.maxAmount = filters.maxAmount;
      if (filters.category) searchParams.category = filters.category;
      if (filters.tags?.length) searchParams.tags = filters.tags.join(',');
      if (filters.isTransfer !== undefined) searchParams.isTransfer = filters.isTransfer;
      if (filters.limit) searchParams.limit = filters.limit;
      if (pageParam) searchParams.cursor = pageParam;

      return api.get('api/v1/transactions', { searchParams }).json<TransactionListResponse>();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionCreate) =>
      api.post('api/v1/transactions', { json: data }).json<Transaction>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateTransaction(transactionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionUpdate) =>
      api.patch(`api/v1/transactions/${transactionId}`, { json: data }).json<Transaction>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferCreate) =>
      api.post('api/v1/transfers', { json: data }).json<Transfer>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => api.delete(`api/v1/transactions/${transactionId}`),
    onSuccess: (_data, transactionId) => {
      queryClient.removeQueries({ queryKey: ['transactions', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
