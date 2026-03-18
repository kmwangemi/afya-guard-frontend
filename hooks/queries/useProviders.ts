import { providersService } from '@/services/providersService';
import { ProviderCreateParams, ProviderFilterParams } from '@/types/provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const PROVIDERS_KEY = 'providers';

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useProviders(
  filters?: ProviderFilterParams,
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [PROVIDERS_KEY, 'list', filters, page, pageSize],
    queryFn: () => providersService.getProviders(filters, page, pageSize),
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

// Fix 3: was [PROVIDERS_KEY, providerId] — collided with list key.
// Fix 6: now calls real getProviderById which returns ProviderDetail (nested response)
export function useProviderById(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_KEY, 'detail', providerId],
    queryFn: () => providersService.getProviderById(providerId),
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
    enabled: !!providerId,
  });
}

// Fix 4: was [PROVIDERS_KEY, providerId, 'statistics'] — same collision
// Fix 8: statistics are nested inside ProviderDetailResponse, not a separate endpoint.
//        Re-uses the detail cache so no extra network call is made.
export function useProviderStatistics(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_KEY, 'detail', providerId], // same key → shares cache with useProviderById
    queryFn: () => providersService.getProviderById(providerId),
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
    enabled: !!providerId,
    select: data => data.statistics,
  });
}

// Fix 1 + 8: getProviderFraudHistory didn't exist; fraud history is nested in detail response
export function useProviderFraudHistory(providerId: string) {
  return useQuery({
    queryKey: [PROVIDERS_KEY, 'detail', providerId], // shares cache
    queryFn: () => providersService.getProviderById(providerId),
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
    enabled: !!providerId,
    select: data => data.fraudHistory,
  });
}

export function useProviderClaims(
  providerId: string,
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [PROVIDERS_KEY, 'claims', providerId, page, pageSize],
    queryFn: () =>
      providersService.getProviderClaims(providerId, page, pageSize),
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
    enabled: !!providerId,
  });
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

// Fix 2: was usePostMutation('/providers/suspend') — endpoint doesn't exist.
// Now uses PATCH /providers/{id} with { accreditation_status: 'SUSPENDED' }
export function useSuspendProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      reason,
    }: {
      providerId: string;
      reason: string;
    }) => providersService.suspendProvider(providerId, reason),
    onSuccess: (_data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [PROVIDERS_KEY, 'detail', providerId],
      });
    },
  });
}

// Fix 2: was usePostMutation('/providers/flag') — endpoint doesn't exist.
// Now uses PATCH /providers/{id} with { high_risk_flag: true }
export function useFlagProviderForReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      reason,
    }: {
      providerId: string;
      reason: string;
    }) => providersService.flagForReview(providerId, reason),
    onSuccess: (_data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [PROVIDERS_KEY, 'detail', providerId],
      });
    },
  });
}

export function useAddProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProviderCreateParams) =>
      providersService.addProvider(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY, 'list'] });
    },
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      providerId,
      data,
    }: {
      providerId: string;
      data: Partial<ProviderCreateParams>;
    }) => providersService.updateProvider(providerId, data),
    onSuccess: (_data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [PROVIDERS_KEY, 'detail', providerId],
      });
    },
  });
}
