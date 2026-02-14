import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePostMutation } from '@/hooks/useApiMutation';
import { mockProvidersService } from '@/services/mockProvidersService';
import { Provider, ProviderFilterParams } from '@/types/provider';

const PROVIDERS_QUERY_KEY = 'providers';

/**
 * Hook to fetch providers with filtering and pagination
 */
export function useProviders(
  filters?: ProviderFilterParams,
  page: number = 1,
  pageSize: number = 25
) {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY, filters, page, pageSize],
    queryFn: async () => {
      return mockProvidersService.getProviders(filters, page, pageSize);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single provider by ID
 */
export function useProviderById(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY, providerId],
    queryFn: async () => {
      return mockProvidersService.getProviderById(providerId);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!providerId,
  });
}

/**
 * Hook to fetch provider statistics
 */
export function useProviderStatistics(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY, providerId, 'statistics'],
    queryFn: async () => {
      return mockProvidersService.getProviderStatistics(providerId);
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!providerId,
  });
}

/**
 * Hook to fetch provider fraud history
 */
export function useProviderFraudHistory(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_QUERY_KEY, providerId, 'fraud-history'],
    queryFn: async () => {
      return mockProvidersService.getProviderFraudHistory(providerId);
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!providerId,
  });
}

/**
 * Hook to suspend a provider
 */
export function useSuspendProvider() {
  const queryClient = useQueryClient();

  return usePostMutation<void, { providerId: string; reason: string }>(
    '/providers/suspend',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [PROVIDERS_QUERY_KEY],
        });
      },
    }
  );
}

/**
 * Hook to flag a provider for review
 */
export function useFlagProviderForReview() {
  const queryClient = useQueryClient();

  return usePostMutation<void, { providerId: string; reason: string }>(
    '/providers/flag',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [PROVIDERS_QUERY_KEY],
        });
      },
    }
  );
}
