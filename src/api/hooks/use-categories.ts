import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Category, CategoryCreate, CategoryUpdate, CategoryType } from '@/api/types';

interface ListCategoriesParams {
  type?: CategoryType;
  sort?: 'name' | 'relevance';
}

export function useCategories(params: ListCategoriesParams = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => {
      const searchParams: Record<string, string> = {};
      if (params.type) searchParams.type = params.type;
      if (params.sort) searchParams.sort = params.sort;
      return api.get('api/v1/categories', { searchParams }).json<Category[]>();
    },
    staleTime: 5 * 60 * 1000,
  });
}

interface SearchCategoriesParams {
  q: string;
  type?: CategoryType;
}

export function useCategorySearch(params: SearchCategoriesParams) {
  return useQuery({
    queryKey: ['categories', 'search', params],
    queryFn: () => {
      const searchParams: Record<string, string> = { q: params.q };
      if (params.type) searchParams.type = params.type;
      return api.get('api/v1/categories/search', { searchParams }).json<Category[]>();
    },
    enabled: params.q.length > 0,
    staleTime: 30 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreate) =>
      api.post('api/v1/categories', { json: data }).json<Category>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryUpdate) =>
      api.patch(`api/v1/categories/${categoryId}`, { json: data }).json<Category>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => api.delete(`api/v1/categories/${categoryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
