'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsService } from '@/services/alertsService';
import type { AlertFilters } from '@/lib/validations';

export function useAlerts(
  page = 1,
  limit = 20,
  filters?: Partial<AlertFilters>,
) {
  return useQuery({
    queryKey: ['alerts', page, limit, filters],
    queryFn: () => alertsService.getAlerts(page, limit, filters),
  });
}
export function useAlertById(id: number) {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => alertsService.getAlertById(id),
    enabled: !!id,
  });
}
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      alertsService.updateAlertStatus(id, status),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', data.id] });
    },
  });
}
export function useAssignAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      investigator_id,
    }: {
      id: number;
      investigator_id: number;
    }) => alertsService.assignAlert(id, investigator_id),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', data.id] });
    },
  });
}
export function useCriticalAlerts(limit = 10) {
  return useQuery({
    queryKey: ['critical-alerts', limit],
    queryFn: () => alertsService.getCriticalAlerts(limit),
  });
}
