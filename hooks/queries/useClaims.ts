import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockClaimsService } from '@/services/mockClaimsService';
import { Claim, ClaimFilterParams } from '@/types/claim';

const CLAIMS_QUERY_KEY = 'claims';

/**
 * Hook to fetch claims with filtering and pagination
 */
export function useClaims(
  filters: ClaimFilterParams = {},
  page: number = 1,
  pageSize: number = 25
) {
  return useQuery({
    queryKey: [CLAIMS_QUERY_KEY, filters, page, pageSize],
    queryFn: () => mockClaimsService.getClaims(filters, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single claim by ID
 */
export function useClaimById(claimId: string) {
  return useQuery({
    queryKey: [CLAIMS_QUERY_KEY, claimId],
    queryFn: () => mockClaimsService.getClaimById(claimId),
    staleTime: 5 * 60 * 1000,
    enabled: !!claimId,
  });
}

/**
 * Hook to fetch claim analysis
 */
export function useClaimAnalysis(claimId: string) {
  return useQuery({
    queryKey: [CLAIMS_QUERY_KEY, claimId, 'analysis'],
    queryFn: () => mockClaimsService.getClaimAnalysis(claimId),
    staleTime: 10 * 60 * 1000,
    enabled: !!claimId,
  });
}

/**
 * Hook to approve a claim
 */
export function useApproveClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, notes }: { claimId: string; notes?: string }) =>
      mockClaimsService.approveClaim(claimId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to reject a claim
 */
export function useRejectClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, reason }: { claimId: string; reason: string }) =>
      mockClaimsService.rejectClaim(claimId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to flag a claim for investigation
 */
export function useFlagClaimForInvestigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, investigationType }: { claimId: string; investigationType: string }) =>
      mockClaimsService.flagForInvestigation(claimId, investigationType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to assign claim to investigator
 */
export function useAssignClaimToInvestigator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claimId,
      investigatorId,
      investigatorName,
    }: {
      claimId: string;
      investigatorId: string;
      investigatorName: string;
    }) =>
      mockClaimsService.assignInvestigator(claimId, investigatorId, investigatorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
    },
  });
}
