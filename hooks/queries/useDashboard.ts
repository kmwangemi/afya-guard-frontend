import { dashboardService } from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';

const DASHBOARD_QUERY_KEY = 'dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: () => dashboardService.getStats(),
    // staleTime: 2 * 60 * 1000,
    // refetchInterval: 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

export function useClaimsTrend(days: number = 30) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'trend', days],
    queryFn: () => dashboardService.getTrendData(days),
    // staleTime: 5 * 60 * 1000,
    // refetchInterval: 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

export function useCountyFraudAnalysis(limit: number = 10) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'counties', limit],
    queryFn: () => dashboardService.getCountyFraudData(limit),
    // staleTime: 10 * 60 * 1000,
    // refetchInterval: 2 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

export function useRecentAlerts(limit: number = 10) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'critical-alerts', limit],
    queryFn: () => dashboardService.getCriticalAlerts(limit),
    // staleTime: 2 * 60 * 1000,
    // refetchInterval: 30 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

export function useDashboard(trendDays: number = 30) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'full', trendDays],
    queryFn: () => dashboardService.getDashboard(trendDays),
    // staleTime: 2 * 60 * 1000,
    // refetchInterval: 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

export function useRiskDistribution() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'risk-distribution'],
    queryFn: () => dashboardService.getRiskDistribution(),
    // staleTime: 5 * 60 * 1000,
    // refetchInterval: 2 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

/**
 * Top N providers ranked by flagged claim count.
 * Refetches every 2 minutes — data changes slowly.
 */
export function useTopFlaggedProviders(limit: number = 10, days: number = 30) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'top-providers', limit, days],
    queryFn: () => dashboardService.getTopFlaggedProviders(limit, days),
    // staleTime: 5 * 60 * 1000,
    // refetchInterval: 2 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}

/**
 * 30-day daily submission trend for a single provider.
 * Enabled only when a providerId is selected.
 */
export function useProviderSubmissionTrend(
  providerId: string | null,
  days: number = 30,
) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'provider-trend', providerId, days],
    queryFn: () =>
      dashboardService.getProviderSubmissionTrend(providerId!, days),
    enabled: !!providerId,
    // staleTime: 5 * 60 * 1000,
    staleTime: 0, // always consider data stale — fetch on every trigger
    refetchInterval: 5 * 1000, // poll every 5 seconds
    refetchIntervalInBackground: true, // keep polling even when tab is not focused
  });
}
