import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';

/**
 * Generic hook for POST requests using React Query
 */
export function useApiMutation<TData, TVariables = any>(
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    'mutationFn'
  >
): UseMutationResult<TData, Error, TVariables> {
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Will be overridden by specific implementations
      throw new Error('mutationFn must be provided');
    },
    ...options,
  });
}

/**
 * Hook for POST requests
 */
export function usePostMutation<TData, TVariables = any>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    'mutationFn'
  >
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await api.post<TData>(url, variables);
      return response;
    },
    ...options,
  });
}

/**
 * Hook for PUT requests
 */
export function usePutMutation<TData, TVariables = any>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    'mutationFn'
  >
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await api.put<TData>(url, variables);
      return response;
    },
    ...options,
  });
}

/**
 * Hook for DELETE requests
 */
export function useDeleteMutation<TData = any, TVariables = any>(
  url: string,
  options?: Omit<
    UseMutationOptions<TData, Error, TVariables>,
    'mutationFn'
  >
): UseMutationResult<TData, Error, TVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await api.delete<TData>(url);
      return response;
    },
    ...options,
  });
}
