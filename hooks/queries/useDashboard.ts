import { useQuery } from '@tanstack/react-query';
import { mockDashboardService } from '@/services/mockDashboardService';

const DASHBOARD_QUERY_KEY = 'dashboard';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'stats'],
    queryFn: async () => {
      return mockDashboardService.getDashboardStats();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates for dashboard
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

/**
 * Hook to fetch 30-day claims trend
 */
export function useClaimsTrend() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'trends'],
    queryFn: async () => {
      return mockDashboardService.getClaimsTrendData();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000,
  });
}

/**
 * Hook to fetch county-wise fraud analysis
 */
export function useCountyFraudAnalysis() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'county-analysis'],
    queryFn: async () => {
      return mockDashboardService.getCountyFraudAnalysis();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 2 * 60 * 1000,
  });
}

/**
 * Hook to fetch recent alerts
 */
export function useRecentAlerts(limit: number = 10) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'recent-alerts', limit],
    queryFn: async () => {
      return mockDashboardService.getRecentAlerts(limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
}
