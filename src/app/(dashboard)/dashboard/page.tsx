'use client';

import { RecentAlertsWidget } from '@/components/dashboard/RecentAlertsWidget';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { useCriticalAlerts } from '@/hooks/useAlerts';
import { useDashboardStats } from '@/hooks/useDashboard';
import { AlertCircle, BarChart3, CheckCircle2, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: alerts, isLoading: alertsLoading } = useCriticalAlerts();
  if (statsLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }
  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
        <p className='text-muted-foreground mt-2'>
          Real-time fraud detection metrics and insights
        </p>
      </div>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatsCard
          title='Total Claims'
          value={stats?.total_claims || 0}
          icon={BarChart3}
        />
        <StatsCard
          title='Flagged Claims'
          value={stats?.flagged_claims || 0}
          icon={AlertCircle}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title='Critical Alerts'
          value={stats?.critical_alerts || 0}
          icon={TrendingUp}
        />
        <StatsCard
          title='Estimated Fraud Amount'
          value={formatCurrency(stats?.estimated_fraud_amount || 0)}
          icon={CheckCircle2}
        />
      </div>
      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <RiskDistributionChart data={stats?.claims_by_risk} />
        <TrendChart data={stats?.fraud_trend} />
      </div>
      {/* Recent Alerts */}
      <RecentAlertsWidget alerts={alerts} isLoading={alertsLoading} />
    </div>
  );
}
