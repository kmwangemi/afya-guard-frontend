import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Investigation, InvestigationFilterParams, InvestigationStatus, CreateInvestigationPayload } from "@/types/investigation";
import { mockInvestigationsService } from "@/services/mockInvestigationsService";

const INVESTIGATIONS_QUERY_KEY = "investigations";

/**
 * Hook to fetch investigations with filtering and pagination
 */
export function useInvestigations(
  filters: InvestigationFilterParams = {},
  page: number = 1,
  pageSize: number = 25
) {
  return useQuery({
    queryKey: [INVESTIGATIONS_QUERY_KEY, { filters, page, pageSize }],
    queryFn: () => mockInvestigationsService.getInvestigations(filters, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * Hook to fetch a single investigation
 */
export function useInvestigationById(investigationId: string) {
  return useQuery({
    queryKey: [INVESTIGATIONS_QUERY_KEY, investigationId],
    queryFn: () => mockInvestigationsService.getInvestigationById(investigationId),
    enabled: !!investigationId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch investigation statistics
 */
export function useInvestigationStats() {
  return useQuery({
    queryKey: [INVESTIGATIONS_QUERY_KEY, "stats"],
    queryFn: () => mockInvestigationsService.getInvestigationStats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new investigation
 */
export function useCreateInvestigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvestigationPayload) =>
      mockInvestigationsService.createInvestigation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTIGATIONS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update investigation status
 */
export function useUpdateInvestigationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investigationId,
      status,
    }: {
      investigationId: string;
      status: InvestigationStatus;
    }) => mockInvestigationsService.updateInvestigationStatus(investigationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTIGATIONS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to update investigation progress
 */
export function useUpdateInvestigationProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investigationId,
      progress,
      notes,
    }: {
      investigationId: string;
      progress: number;
      notes?: string;
    }) =>
      mockInvestigationsService.updateInvestigationProgress(
        investigationId,
        progress,
        notes
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTIGATIONS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to add evidence to investigation
 */
export function useAddInvestigationEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investigationId,
      evidence,
    }: {
      investigationId: string;
      evidence: {
        fileName: string;
        fileType: string;
        fileUrl: string;
        uploadedBy: string;
        description?: string;
      };
    }) =>
      mockInvestigationsService.addInvestigationEvidence(investigationId, evidence),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTIGATIONS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to close investigation with outcome
 */
export function useCloseInvestigation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      investigationId,
      outcome,
      notes,
    }: {
      investigationId: string;
      outcome: Investigation["outcome"];
      notes?: string;
    }) =>
      mockInvestigationsService.closeInvestigation(investigationId, outcome, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVESTIGATIONS_QUERY_KEY] });
    },
  });
}
