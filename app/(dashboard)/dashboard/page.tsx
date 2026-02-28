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

// Risk distribution — widths are percentages of the highest count (15,928)
// so bars are proportional to each other and never exceed 100%
const RISK_ITEMS = [
  {
    label: 'Critical',
    count: 847,
    display: '847 (2.8%)',
    width: Math.round((847 / 15928) * 100), // ~5%
    color: 'bg-purple-600',
  },
  {
    label: 'High',
    count: 3245,
    display: '3,245 (12.3%)',
    width: Math.round((3245 / 15928) * 100), // ~20%
    color: 'bg-red-600',
  },
  {
    label: 'Medium',
    count: 6547,
    display: '6,547 (24.8%)',
    width: Math.round((6547 / 15928) * 100), // ~41%
    color: 'bg-amber-500',
  },
  {
    label: 'Low',
    count: 15928,
    display: '15,928 (60.1%)',
    width: 100, // highest value = full bar
    color: 'bg-green-600',
  },
];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: trendData, isLoading: trendLoading } = useClaimsTrend();
  const { data: countyData, isLoading: countyLoading } =
    useCountyFraudAnalysis();
  const { data: alerts, isLoading: alertsLoading } = useRecentAlerts(10);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'trends'] }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'county-analysis'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['dashboard', 'recent-alerts'],
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        {/* Stat Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatCard
            title='Total Claims Processed'
            value={stats?.totalClaimsProcessed ?? 0}
            icon={BarChart3}
            color='blue'
            change={{ value: 12, trend: 'up' }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Flagged Claims'
            value={stats?.flaggedClaims ?? 0}
            icon={AlertTriangle}
            color='red'
            change={{ value: 8, trend: 'up' }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Critical Alerts'
            value={stats?.criticalAlerts ?? 0}
            icon={TrendingUp}
            color='orange'
            change={{ value: 3, trend: 'down' }}
            isLoading={statsLoading}
          />
          <StatCard
            title='Fraud Prevented'
            value={formatCurrency(stats?.estimatedFraudPrevented ?? 0)}
            icon={Shield}
            color='green'
            change={{ value: 25, trend: 'up' }}
            isLoading={statsLoading}
          />
        </div>
        {/* Charts row */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <TrendChart data={trendData || []} isLoading={trendLoading} />
          </div>
          {/* Risk Distribution — FIX: bars are now proportional (max 100%) */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg p-6 border border-gray-200 h-full'>
              <h3 className='font-semibold text-gray-900 mb-4'>
                Risk Distribution
              </h3>
              <div className='space-y-4'>
                {RISK_ITEMS.map(item => (
                  <div key={item.label}>
                    <div className='flex justify-between mb-1.5'>
                      <span className='text-sm text-gray-600'>
                        {item.label}
                      </span>
                      <span className='text-sm font-medium text-gray-800'>
                        {item.display}
                      </span>
                    </div>
                    {/* overflow-hidden ensures bar never bleeds outside */}
                    <div className='w-full bg-gray-100 rounded-full h-2 overflow-hidden'>
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className='mt-5 pt-4 border-t border-gray-100 flex justify-between text-sm'>
                <span className='text-gray-500'>Total claims</span>
                <span className='font-semibold text-gray-900'>26,567</span>
              </div>
            </div>
          </div>
        </div>
        {/* County Heatmap */}
        <CountyHeatmap data={countyData || []} isLoading={countyLoading} />
        {/* Recent Alerts */}
        <RecentAlerts alerts={alerts || []} isLoading={alertsLoading} />
      </div>
    </DashboardLayout>
  );
}
