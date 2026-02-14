import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Generic hook for GET requests using React Query
 * Automatically handles loading, error, and caching
 */
export function useApiQuery<TData>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData> {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await api.get<TData>(url);
      return response;
    },
    ...options,
  });
}

/**
 * Hook for fetching paginated data
 */
export function useApiPaginatedQuery<TData>(
  queryKey: string[],
  url: string,
  page: number = 1,
  pageSize: number = 25,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
): UseQueryResult<any> {
  return useQuery({
    queryKey: [...queryKey, page, pageSize],
    queryFn: async () => {
      const response = await api.get(url, {
        params: {
          page,
          pageSize,
        },
      });
      return response;
    },
    ...options,
  });
}
