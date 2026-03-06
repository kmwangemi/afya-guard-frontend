import { investigationsService } from '@/services/investigationsService';
import {
  CreateInvestigationPayload,
  InvestigationFilterParams,
  UpdateProgressPayload,
  UpdateStatusPayload,
  UploadEvidencePayload,
} from '@/types/investigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const INV_KEY = 'investigations';

// ─── Query hooks ──────────────────────────────────────────────────────────────

// Fix 15: calls real investigationsService
export function useInvestigations(
  filters: InvestigationFilterParams = {},
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [INV_KEY, 'list', filters, page, pageSize],
    queryFn: () =>
      investigationsService.getInvestigations(filters, page, pageSize),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
// Fix 16: scoped key ['investigations', 'detail', id] — was colliding with list key
// Fix 8: now returns InvestigationDetail (nested response)
export function useInvestigationById(investigationId: string) {
  return useQuery({
    queryKey: [INV_KEY, 'detail', investigationId],
    queryFn: () => investigationsService.getInvestigationById(investigationId),
    enabled: !!investigationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvestigationNotes(investigationId: string) {
  return useQuery({
    queryKey: [INV_KEY, 'notes', investigationId],
    queryFn: () => investigationsService.getNotes(investigationId),
    enabled: !!investigationId,
    staleTime: 2 * 60 * 1000,
  });
}
// Fix 17: useInvestigationStats removed — no backend endpoint

// ─── Mutation hooks ───────────────────────────────────────────────────────────

// Fix 9: payload now requires claimId + fraudScoreId
export function useCreateInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInvestigationPayload) =>
      investigationsService.createInvestigation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INV_KEY, 'list'] });
    },
  });
}
// Fix 18: payload is now { status, resolutionSummary?, estimatedLoss? }
export function useUpdateInvestigationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      payload,
    }: {
      investigationId: string;
      payload: UpdateStatusPayload;
    }) => investigationsService.updateStatus(investigationId, payload),
    onSuccess: (_data, { investigationId }) => {
      // Fix 22: scoped invalidation
      queryClient.invalidateQueries({ queryKey: [INV_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
// Fix 19: payload is now { progress, findings? }
export function useUpdateInvestigationProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      payload,
    }: {
      investigationId: string;
      payload: UpdateProgressPayload;
    }) => investigationsService.updateProgress(investigationId, payload),
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: [INV_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
export function useAssignInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      assignedTo,
    }: {
      investigationId: string;
      assignedTo: string;
    }) =>
      investigationsService.assignInvestigation(investigationId, assignedTo),
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: [INV_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
// Fix 20: payload is now { fileName, fileType, fileUrl } — uploadedBy removed
export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      payload,
    }: {
      investigationId: string;
      payload: UploadEvidencePayload;
    }) => investigationsService.uploadEvidence(investigationId, payload),
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      note,
    }: {
      investigationId: string;
      note: string;
    }) => investigationsService.addNote(investigationId, note),
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'notes', investigationId],
      });
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
// Fix 21: no dedicated close endpoint — delegates to updateStatus with terminal state
export function useCloseInvestigation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investigationId,
      status,
      resolutionSummary,
      estimatedLoss,
    }: {
      investigationId: string;
      status: 'CONFIRMED_FRAUD' | 'CLEARED' | 'CLOSED';
      resolutionSummary: string;
      estimatedLoss?: number;
    }) =>
      investigationsService.closeInvestigation(
        investigationId,
        status,
        resolutionSummary,
        estimatedLoss,
      ),
    onSuccess: (_data, { investigationId }) => {
      queryClient.invalidateQueries({ queryKey: [INV_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [INV_KEY, 'detail', investigationId],
      });
    },
  });
}
