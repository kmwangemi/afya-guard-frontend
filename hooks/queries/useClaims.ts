import { claimsService } from '@/services/claimsService';
import { ClaimFilterParams } from '@/types/claim';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const CLAIMS_KEY = 'claims';

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useClaims(
  filters: ClaimFilterParams = {},
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [CLAIMS_KEY, 'list', filters, page, pageSize],
    queryFn: () => claimsService.getClaims(filters, page, pageSize),
    staleTime: 5 * 60 * 1000,
  });
}

// Fix 10: was [CLAIMS_KEY, claimId] which collided with the list key structure.
// Now uses a 'detail' segment so invalidation is scoped correctly.
export function useClaimById(claimId: string) {
  return useQuery({
    queryKey: [CLAIMS_KEY, 'detail', claimId],
    queryFn: () => claimsService.getClaimById(claimId),
    staleTime: 5 * 60 * 1000,
    enabled: !!claimId,
  });
}

// Fix 10: same — was [CLAIMS_KEY, claimId, 'analysis']
// The service re-uses GET /claims/{id} and extracts fraud_analysis,
// so no extra network call happens when both hooks are used on the same page.
export function useClaimAnalysis(claimId: string) {
  return useQuery({
    queryKey: [CLAIMS_KEY, 'detail', claimId, 'analysis'],
    queryFn: () => claimsService.getClaimAnalysis(claimId),
    staleTime: 10 * 60 * 1000,
    enabled: !!claimId,
  });
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────
// Fix 11: mutations now invalidate both the list AND the specific detail cache,
//         so the detail page reflects the new status without a manual refresh.

function useClaimMutation<TVar>(
  mutationFn: (vars: TVar) => Promise<unknown>,
  claimIdFn: (vars: TVar) => string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, vars) => {
      const claimId = claimIdFn(vars);
      // Invalidate the full list (status badge changes)
      queryClient.invalidateQueries({ queryKey: [CLAIMS_KEY, 'list'] });
      // Invalidate the specific detail + analysis (action buttons, status bar)
      queryClient.invalidateQueries({
        queryKey: [CLAIMS_KEY, 'detail', claimId],
      });
    },
  });
}

export function useApproveClaim() {
  return useClaimMutation(
    ({ claimId, notes }: { claimId: string; notes?: string }) =>
      claimsService.approveClaim(claimId, notes),
    v => v.claimId,
  );
}

export function useRejectClaim() {
  return useClaimMutation(
    ({ claimId, reason }: { claimId: string; reason: string }) =>
      claimsService.rejectClaim(claimId, reason),
    v => v.claimId,
  );
}

export function useFlagClaimForInvestigation() {
  return useClaimMutation(
    ({
      claimId,
      investigationType,
    }: {
      claimId: string;
      investigationType: string;
    }) => claimsService.flagForInvestigation(claimId, investigationType),
    v => v.claimId,
  );
}

export function useAssignClaimToInvestigator() {
  return useClaimMutation(
    ({
      claimId,
      investigatorId,
      investigatorName,
    }: {
      claimId: string;
      investigatorId: string;
      investigatorName: string;
    }) =>
      claimsService.assignInvestigator(
        claimId,
        investigatorId,
        investigatorName,
      ),
    v => v.claimId,
  );
}
