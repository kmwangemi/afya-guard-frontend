import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertFilterParams, AlertStatus } from "@/types/alert";
import { mockAlertsService } from "@/services/mockAlertsService";

const ALERTS_QUERY_KEY = "alerts";

/**
 * Hook to fetch alerts with filtering and pagination
 */
export function useAlerts(
  filters: AlertFilterParams = {},
  page: number = 1,
  pageSize: number = 25
) {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, { filters, page, pageSize }],
    queryFn: () => mockAlertsService.getAlerts(filters, page, pageSize),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

/**
 * Hook to fetch a single alert
 */
export function useAlertById(alertId: string) {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, alertId],
    queryFn: () => mockAlertsService.getAlertById(alertId),
    enabled: !!alertId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch critical alerts
 */
export function useCriticalAlerts(limit: number = 10) {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, "critical", limit],
    queryFn: () => mockAlertsService.getCriticalAlerts(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch alert statistics
 */
export function useAlertStats() {
  return useQuery({
    queryKey: [ALERTS_QUERY_KEY, "stats"],
    queryFn: () => mockAlertsService.getAlertStats(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to update alert status
 */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: AlertStatus }) =>
      mockAlertsService.updateAlertStatus(alertId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to assign alert to investigator
 */
export function useAssignAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      investigatorId,
      investigatorName,
    }: {
      alertId: string;
      investigatorId: string;
      investigatorName: string;
    }) => mockAlertsService.assignAlert(alertId, investigatorId, investigatorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to resolve an alert
 */
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      resolutionNotes,
      actionTaken,
    }: {
      alertId: string;
      resolutionNotes: string;
      actionTaken?: string;
    }) => mockAlertsService.resolveAlert(alertId, resolutionNotes, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_QUERY_KEY] });
    },
  });
}
