'use client';

import { CountyHeatmap } from '@/components/dashboard/CountyHeatmap';
import { FraudRateChart } from '@/components/dashboard/FraudRateChart';
import { ProviderSubmissionChart } from '@/components/dashboard/ProviderSubmissionChart';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { StatCard } from '@/components/dashboard/StatCard';
import { TopFlaggedProviders } from '@/components/dashboard/TopFlaggedProviders';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  useClaimsTrend,
  useCountyFraudAnalysis,
  useDashboardStats,
  useRecentAlerts,
  useRiskDistribution,
  useTopFlaggedProviders,
} from '@/hooks/queries/useDashboard';
import { formatCurrency } from '@/lib/helpers';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
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
  const { data: providers, isLoading: providersLoading } =
    useTopFlaggedProviders(10, 30);
  // Invalidating the root 'dashboard' key cascades to all sub-keys
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } finally {
      setIsRefreshing(false);
    }
  };
  // Risk distribution bars proportional to highest count
  const riskItems = riskData?.items ?? [];
  const maxCount = Math.max(...riskItems.map(i => i.count), 1);
  // ── Derived quick-stats for secondary cards ───────────────────────────────
  // Flag rate = flaggedClaims / totalClaimsProcessed (%)
  const flagRate =
    stats && stats.totalClaimsProcessed > 0
      ? (stats.flaggedClaims / stats.totalClaimsProcessed) * 100
      : null;
  // Avg loss per flagged claim
  const avgLossPerFlag =
    stats && stats.flaggedClaims > 0
      ? stats.estimatedFraudPrevented / stats.flaggedClaims
      : null;
  // Top provider risk score (first item from sorted list)
  const topProviderScore = providers?.[0]?.avg_risk_score ?? null;
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* ── Header ─────────────────────────────────────────────────────── */}
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
        {/* ── Primary stat cards ─────────────────────────────────────────── */}
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
        {/* ── Secondary insight cards ────────────────────────────────────── */}
        {/* These are derived from existing data — zero extra API calls.      */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Overall flag rate */}
          <div className='bg-white border border-gray-200 rounded-lg p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                  Overall Flag Rate
                </p>
                {statsLoading ? (
                  <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {flagRate !== null ? `${flagRate.toFixed(2)}%` : '—'}
                  </p>
                )}
                <p className='text-xs text-gray-400 mt-1'>
                  Flagged ÷ total processed
                </p>
              </div>
              <div className='p-2.5 bg-red-50 rounded-lg'>
                <AlertTriangle className='h-5 w-5 text-red-500' />
              </div>
            </div>
          </div>
          {/* Avg loss per flagged claim */}
          <div className='bg-white border border-gray-200 rounded-lg p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                  Avg Fraud per Flagged Claim
                </p>
                {statsLoading ? (
                  <div className='h-8 w-28 bg-gray-200 rounded animate-pulse' />
                ) : (
                  <p className='text-2xl font-bold text-gray-900'>
                    {avgLossPerFlag !== null
                      ? formatCurrency(avgLossPerFlag)
                      : '—'}
                  </p>
                )}
                <p className='text-xs text-gray-400 mt-1'>
                  Fraud prevented ÷ flagged claims
                </p>
              </div>
              <div className='p-2.5 bg-green-50 rounded-lg'>
                <Shield className='h-5 w-5 text-green-500' />
              </div>
            </div>
          </div>
          {/* Highest-risk provider avg score */}
          <div className='bg-white border border-gray-200 rounded-lg p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                  Top Provider Risk Score
                </p>
                {providersLoading ? (
                  <div className='h-8 w-16 bg-gray-200 rounded animate-pulse' />
                ) : (
                  <p
                    className='text-2xl font-bold'
                    style={{
                      color:
                        topProviderScore !== null && topProviderScore >= 80
                          ? '#dc2626'
                          : topProviderScore !== null && topProviderScore >= 60
                            ? '#ea580c'
                            : '#374151',
                    }}
                  >
                    {topProviderScore !== null
                      ? `${topProviderScore.toFixed(1)} / 100`
                      : '—'}
                  </p>
                )}
                <p className='text-xs text-gray-400 mt-1'>
                  {providers?.[0]?.name
                    ? providers[0].name.length > 22
                      ? providers[0].name.slice(0, 22) + '…'
                      : providers[0].name
                    : 'Highest flagged provider'}
                </p>
              </div>
              <div className='p-2.5 bg-orange-50 rounded-lg'>
                <Users className='h-5 w-5 text-orange-500' />
              </div>
            </div>
          </div>
        </div>
        {/* ── Charts row — trend + risk distribution ─────────────────────── */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <TrendChart data={trendData ?? []} isLoading={trendLoading} />
          </div>
          {/* Risk Distribution */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg p-6 border border-gray-200 h-full'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                Risk Distribution
              </h3>
              {riskLoading ? (
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
        {/* ── Daily Fraud Rate ──────────────────────────────────────────── */}
        {/* Derived from the same trendData — no extra API call needed.      */}
        <FraudRateChart data={trendData ?? []} isLoading={trendLoading} />
        {/* ── Top Flagged Providers + Provider Submission Trend ─────────── */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <TopFlaggedProviders
            data={providers ?? []}
            isLoading={providersLoading}
          />
          <ProviderSubmissionChart
            providers={providers ?? []}
            isLoading={providersLoading}
          />
        </div>
        {/* ── County Heatmap ─────────────────────────────────────────────── */}
        <CountyHeatmap data={countyData ?? []} isLoading={countyLoading} />
        {/* ── Recent Alerts ──────────────────────────────────────────────── */}
        <RecentAlerts alerts={alerts ?? []} isLoading={alertsLoading} />
      </div>
    </DashboardLayout>
  );
}
