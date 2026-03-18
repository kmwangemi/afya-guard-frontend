import { alertsService } from '@/services/alertsService';
import {
  AlertAssignPayload,
  AlertFilterParams,
  AlertResolvePayload,
  AlertStatusUpdatePayload,
} from '@/types/alert';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ALERTS_KEY = 'alerts';

// ─── Query hooks ──────────────────────────────────────────────────────────────

// Fix 7: calls real alertsService
export function useAlerts(
  filters: AlertFilterParams = {},
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [ALERTS_KEY, 'list', filters, page, pageSize],
    queryFn: () => alertsService.getAlerts(filters, page, pageSize),
    // staleTime: 2 * 60 * 1000,
    // refetchInterval: 30 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}
// Fix 8: was [ALERTS_KEY, alertId] — collided with list key structure
export function useAlertById(alertId: string) {
  return useQuery({
    queryKey: [ALERTS_KEY, 'detail', alertId],
    queryFn: () => alertsService.getAlertById(alertId),
    enabled: !!alertId,
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}
// Fix 9: no getCriticalAlerts endpoint — delegates to GET /alerts?severity=CRITICAL&page_size=limit
export function useCriticalAlerts(limit: number = 10) {
  return useQuery({
    queryKey: [ALERTS_KEY, 'critical', limit],
    queryFn: () => alertsService.getCriticalAlerts(limit),
    // staleTime: 1 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}
// Fix 10: no getAlertStats endpoint — removed. Use useAlerts with status filters
// to derive counts client-side, or add a dedicated backend endpoint later.

// ─── Mutation hooks ───────────────────────────────────────────────────────────

// Fix 11: real PATCH /alerts/{id}/status; fix 15: scoped invalidation
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      alertId,
      payload,
    }: {
      alertId: string;
      payload: AlertStatusUpdatePayload;
    }) => alertsService.updateAlertStatus(alertId, payload),
    onSuccess: (_data, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [ALERTS_KEY, 'detail', alertId],
      });
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'critical'] });
    },
  });
}
// Fix 14: new hook — PATCH /alerts/{id}/acknowledge
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, note }: { alertId: string; note?: string }) =>
      alertsService.acknowledgeAlert(alertId, note),
    onSuccess: (_data, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [ALERTS_KEY, 'detail', alertId],
      });
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'critical'] });
    },
  });
}
// Fix 13: real PATCH /alerts/{id}/resolve; payload shape changed
// was { resolutionNotes, actionTaken } → now { resolutionNote, isFalsePositive }
export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      alertId,
      payload,
    }: {
      alertId: string;
      payload: AlertResolvePayload;
    }) => alertsService.resolveAlert(alertId, payload),
    onSuccess: (_data, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [ALERTS_KEY, 'detail', alertId],
      });
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'critical'] });
    },
  });
}
// Fix 12: real PATCH /alerts/{id}/assign; payload was { investigatorId, investigatorName }
// Backend only accepts { user_id: UUID } — investigatorName is not a field
export function useAssignAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      alertId,
      payload,
    }: {
      alertId: string;
      payload: AlertAssignPayload;
    }) => alertsService.assignAlert(alertId, payload),
    onSuccess: (_data, { alertId }) => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_KEY, 'list'] });
      queryClient.invalidateQueries({
        queryKey: [ALERTS_KEY, 'detail', alertId],
      });
    },
  });
}
