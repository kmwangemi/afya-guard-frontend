'use client';

import { CountyHeatmap } from '@/components/dashboard/CountyHeatmap';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  useClaimsTrend,
  useCountyFraudAnalysis,
  useDashboardStats,
  useRecentAlerts,
  useRiskDistribution,
} from '@/hooks/queries/useDashboard';
import { formatCurrency } from '@/lib/helpers';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

// Colour map — backend sends "purple" | "red" | "orange" | "green"
const COLOUR_CLASS: Record<string, string> = {
  purple: 'bg-purple-600',
  red: 'bg-red-600',
  orange: 'bg-amber-500',
  green: 'bg-green-600',
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trendData, isLoading: trendLoading } = useClaimsTrend();
  const { data: countyData, isLoading: countyLoading } =
    useCountyFraudAnalysis();
  const { data: alerts, isLoading: alertsLoading } = useRecentAlerts(10);
  const { data: riskData, isLoading: riskLoading } = useRiskDistribution();

  // ── Refresh — invalidate with the SAME keys used in the hooks ──────────────
  // Previously these were 'trends' / 'county-analysis' / 'recent-alerts' which
  // didn't match the actual keys ('trend' / 'counties' / 'critical-alerts').
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      // Invalidating the root key cascades to all sub-keys:
      // ['dashboard','stats'], ['dashboard','trend',30],
      // ['dashboard','counties',10], ['dashboard','critical-alerts',10],
      // ['dashboard','risk-distribution']
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Risk distribution bars ─────────────────────────────────────────────────
  // Bars are proportional to the highest count so they never overflow 100%.
  // Falls back to empty list while loading.
  const riskItems = riskData?.items ?? [];
  const maxCount = Math.max(...riskItems.map(i => i.count), 1);

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Dashboard</h1>
            <p className='text-gray-600 mt-1'>
              Healthcare fraud detection overview
            </p>
          </div>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
        {/* Stat Cards — change values now come from the backend */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            title='Total Claims Processed'
            value={stats?.totalClaimsProcessed ?? 0}
            icon={BarChart3}
            color='blue'
            change={{
              value: Math.abs(stats?.totalClaimsChange ?? 0),
              trend: (stats?.totalClaimsChange ?? 0) >= 0 ? 'up' : 'down',
            }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Flagged Claims'
            value={stats?.flaggedClaims ?? 0}
            icon={AlertTriangle}
            color='red'
            change={{
              value: Math.abs(stats?.flaggedClaimsChange ?? 0),
              trend: (stats?.flaggedClaimsChange ?? 0) >= 0 ? 'up' : 'down',
            }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Critical Alerts'
            value={stats?.criticalAlerts ?? 0}
            icon={TrendingUp}
            color='orange'
            change={{
              value: Math.abs(stats?.criticalAlertsChange ?? 0),
              trend: (stats?.criticalAlertsChange ?? 0) >= 0 ? 'up' : 'down',
            }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Fraud Prevented'
            value={formatCurrency(stats?.estimatedFraudPrevented ?? 0)}
            icon={Shield}
            color='green'
            change={{
              value: Math.abs(stats?.fraudPreventedChange ?? 0),
              trend: (stats?.fraudPreventedChange ?? 0) >= 0 ? 'up' : 'down',
            }}
            isLoading={statsLoading}
          />
        </div>
        {/* Charts row */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <TrendChart data={trendData ?? []} isLoading={trendLoading} />
          </div>
          {/* Risk Distribution — live data from backend */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg p-6 border border-gray-200 h-full'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                Risk Distribution
              </h3>
              {riskLoading ? (
                // Skeleton while loading
                <div className='space-y-4'>
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className='animate-pulse'>
                      <div className='h-3 bg-gray-200 rounded w-1/2 mb-2' />
                      <div className='h-2 bg-gray-200 rounded w-full' />
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-4'>
                  {riskItems.map(item => (
                    <div key={item.risk_level}>
                      <div className='flex justify-between mb-1.5'>
                        <span className='text-sm text-gray-600'>
                          {item.label}
                        </span>
                        <span className='text-sm font-medium text-gray-800'>
                          {item.count.toLocaleString()} (
                          {item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className='w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
                        <div
                          className={`${COLOUR_CLASS[item.colour] ?? 'bg-gray-400'} h-2 rounded-full transition-all duration-500`}
                          style={{
                            width: `${Math.round((item.count / maxCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Total */}
              <div className='mt-5 pt-4 border-t border-gray-100 flex justify-between text-sm'>
                <span className='text-gray-500'>Total claims</span>
                <span className='font-semibold text-gray-900'>
                  {riskLoading
                    ? '—'
                    : (riskData?.totalClaims ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* County Heatmap */}
        <CountyHeatmap data={countyData ?? []} isLoading={countyLoading} />
        {/* Recent Alerts */}
        <RecentAlerts alerts={alerts ?? []} isLoading={alertsLoading} />
      </div>
    </DashboardLayout>
  );
}
