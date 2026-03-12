import { dashboardService } from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';

const DASHBOARD_QUERY_KEY = 'dashboard';

/**
 * Four stat cards — Total Claims Processed, Flagged Claims,
 * Critical Alerts, Estimated Fraud Prevented.
 *
 * Refetches every 60 s so the numbers stay fresh without a page reload.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: () => dashboardService.getStats(), // was: getDashboardStats()
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Daily trend data for the 30-day chart.
 *
 * @param days  Number of days to fetch (default 30, backend accepts 7–90)
 */
export function useClaimsTrend(days: number = 30) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'trend', days], // include days so cache is per-window
    queryFn: () => dashboardService.getTrendData(days), // was: getClaimsTrendData()
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Top counties by fraud rate for the county table.
 *
 * @param limit  Number of counties to return (default 10)
 */
export function useCountyFraudAnalysis(limit: number = 10) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'counties', limit], // include limit in cache key
    queryFn: () => dashboardService.getCountyFraudData(limit), // was: getCountyFraudAnalysis()
    staleTime: 10 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Recent CRITICAL alerts for the bottom dashboard table.
 *
 * @param limit  Number of alerts to return (default 10)
 */
export function useRecentAlerts(limit: number = 10) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'critical-alerts', limit],
    queryFn: () => dashboardService.getCriticalAlerts(limit), // was: getRecentAlerts()
    staleTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/**
 * Full dashboard in one call — fetches stats + trend + counties
 * in a single round-trip instead of 4 separate requests.
 *
 * Use this on the dashboard page load; the individual hooks above
 * are useful when you only need one widget in isolation.
 *
 * @param trendDays  Trend window in days (default 30)
 */
export function useDashboard(trendDays: number = 30) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'full', trendDays],
    queryFn: () => dashboardService.getDashboard(trendDays),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Risk Distribution panel — Critical / High / Medium / Low bars.
 * Pulled from the backend so bars reflect live data, not hardcoded values.
 */
export function useRiskDistribution() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'risk-distribution'],
    queryFn: () => dashboardService.getRiskDistribution(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
