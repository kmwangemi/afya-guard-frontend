'use client';

import { Card } from '@/components/ui/card';
import { useProviderSubmissionTrend } from '@/hooks/queries/useDashboard';
import { TopFlaggedProvider } from '@/services/dashboardService';
import Link from 'next/link';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProviderSubmissionChartProps {
  providers: TopFlaggedProvider[]; // top providers list (for the selector)
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { name: string; value: number; color: string }[];
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm'>
      <p className='font-semibold text-gray-700 mb-1.5'>{label}</p>
      {payload.map(p => (
        <div key={p.name} className='flex justify-between gap-6'>
          <span style={{ color: p.color }}>{p.name}</span>
          <span className='font-medium text-gray-900'>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className='flex justify-between gap-6 border-t mt-1.5 pt-1.5 text-gray-500'>
          <span>Fraud Rate</span>
          <span className='font-medium text-red-600'>
            {payload[0].value > 0
              ? ((payload[1].value / payload[0].value) * 100).toFixed(1) + '%'
              : '—'}
          </span>
        </div>
      )}
    </div>
  );
}

// Inner component that fetches trend data for the selected provider
function ProviderTrendContent({ providerId }: { providerId: string }) {
  const { data, isLoading } = useProviderSubmissionTrend(providerId, 30);
  if (isLoading) {
    return <div className='h-64 bg-gray-100 rounded animate-pulse' />;
  }
  if (!data?.trend.length) {
    return (
      <div className='h-64 flex items-center justify-center text-gray-400 text-sm'>
        No submission data for this provider in the last 30 days
      </div>
    );
  }
  // Format date labels to "Feb 04" style
  const chartData = data.trend.map(pt => ({
    ...pt,
    label: new Date(pt.date).toLocaleDateString('en-GB', {
      month: 'short',
      day: '2-digit',
    }),
  }));
  // Show every ~5th tick to avoid crowding
  const tickInterval = Math.max(1, Math.floor(chartData.length / 6));
  return (
    <ResponsiveContainer width='100%' height={260}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id='totalGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.15} />
            <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
          </linearGradient>
          <linearGradient id='flaggedGrad' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='#ef4444' stopOpacity={0.2} />
            <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' stroke='#f3f4f6' />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          stroke='#e5e7eb'
          interval={tickInterval}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          stroke='none'
          tickFormatter={v => v.toLocaleString()}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType='circle'
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area
          type='monotone'
          dataKey='total_claims'
          name='Total Claims'
          stroke='#3b82f6'
          strokeWidth={2}
          fill='url(#totalGrad)'
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type='monotone'
          dataKey='flagged_claims'
          name='Flagged Claims'
          stroke='#ef4444'
          strokeWidth={2}
          fill='url(#flaggedGrad)'
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ProviderSubmissionChart({
  providers,
  isLoading,
}: ProviderSubmissionChartProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProvider = providers[selectedIndex] ?? null;
  if (isLoading) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold text-gray-900 mb-4'>
          Provider Submission Trend
        </h3>
        <div className='h-72 bg-gray-100 rounded animate-pulse' />
      </Card>
    );
  }
  if (!providers.length) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold text-gray-900 mb-4'>
          Provider Submission Trend
        </h3>
        <p className='text-gray-500 text-sm py-8 text-center'>
          No provider data available
        </p>
      </Card>
    );
  }
  return (
    <Card className='p-6'>
      {/* Header */}
      <div className='flex items-start justify-between mb-4 gap-4'>
        <div>
          <h3 className='font-semibold text-gray-900'>
            Provider Submission Trend
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            30-day daily claim volume for a selected high-risk provider
          </p>
        </div>
        {selectedProvider && (
          <Link
            href={`/providers/${selectedProvider.provider_id}`}
            className='text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap mt-0.5'
          >
            View Provider →
          </Link>
        )}
      </div>
      {/* Provider selector pills */}
      <div className='flex flex-wrap gap-1.5 mb-5'>
        {providers.slice(0, 6).map((p, i) => (
          <button
            key={p.provider_id}
            onClick={() => setSelectedIndex(i)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              i === selectedIndex
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {p.name.length > 22 ? p.name.substring(0, 20) + '…' : p.name}
          </button>
        ))}
      </div>
      {/* Selected provider summary strip */}
      {selectedProvider && (
        <div className='flex items-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg text-sm'>
          <div>
            <span className='text-gray-500 text-xs'>Fraud Rate</span>
            <p
              className='font-semibold'
              style={{
                color:
                  selectedProvider.fraud_rate >= 0.15
                    ? '#dc2626'
                    : selectedProvider.fraud_rate >= 0.07
                      ? '#d97706'
                      : '#16a34a',
              }}
            >
              {(selectedProvider.fraud_rate * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Flagged</span>
            <p className='font-semibold text-red-600'>
              {selectedProvider.flagged_claims.toLocaleString()}
            </p>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>Avg Risk Score</span>
            <p className='font-semibold text-gray-800'>
              {selectedProvider.avg_risk_score.toFixed(0)}/100
            </p>
          </div>
          <div>
            <span className='text-gray-500 text-xs'>County</span>
            <p className='font-semibold text-gray-800'>
              {selectedProvider.county ?? '—'}
            </p>
          </div>
        </div>
      )}
      {/* Chart */}
      {selectedProvider && (
        <ProviderTrendContent providerId={selectedProvider.provider_id} />
      )}
    </Card>
  );
}
