'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useProviderSubmissionTrend } from '@/hooks/queries/useDashboard';
import { formatCurrency, formatPercentage } from '@/lib/helpers';
import { TopFlaggedProvider } from '@/services/dashboardService';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TopFlaggedProvidersProps {
  data: TopFlaggedProvider[];
  isLoading?: boolean;
}

// Risk-score → colour band
function riskColor(score: number): string {
  if (score >= 80) return '#dc2626'; // red-600
  if (score >= 60) return '#ea580c'; // orange-600
  if (score >= 40) return '#ca8a04'; // yellow-600
  return '#16a34a'; // green-600
}

function riskBg(score: number): string {
  if (score >= 80) return 'bg-red-100 text-red-700 border-red-200';
  if (score >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
}

// ── Sparkline drawer (inline trend for selected row) ─────────────────────────

function ProviderTrendPanel({ providerId }: { providerId: string }) {
  const { data, isLoading } = useProviderSubmissionTrend(providerId);
  if (isLoading) {
    return <div className='h-40 bg-gray-50 rounded-lg animate-pulse mt-2' />;
  }
  if (!data || data.trend.length === 0) {
    return (
      <div className='h-40 flex items-center justify-center text-sm text-gray-400 mt-2'>
        No trend data available
      </div>
    );
  }
  const chartData = data.trend.map(p => ({
    date: p.date.slice(5), // "MM-DD"
    total: p.total_claims,
    flagged: p.flagged_claims,
  }));
  return (
    <div className='mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100'>
      <p className='text-xs font-medium text-gray-500 mb-2'>
        30-Day Submission Trend — {data.provider_name}
      </p>
      <ResponsiveContainer width='100%' height={130}>
        <LineChart
          data={chartData}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            interval='preserveStartEnd'
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: 11,
            }}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Line
            type='monotone'
            dataKey='total'
            name='Total'
            stroke='#3b82f6'
            strokeWidth={1.5}
            dot={false}
          />
          <Line
            type='monotone'
            dataKey='flagged'
            name='Flagged'
            stroke='#ef4444'
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TopFlaggedProviders({
  data,
  isLoading,
}: TopFlaggedProvidersProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'table'>('bar');
  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-semibold text-gray-900'>Top Flagged Providers</h3>
        </div>
        <div className='space-y-2'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-12 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      </Card>
    );
  }
  if (data.length === 0) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold text-gray-900 mb-4'>
          Top Flagged Providers
        </h3>
        <div className='py-8 text-center'>
          <AlertTriangle className='h-10 w-10 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 text-sm'>
            No flagged providers in this period
          </p>
        </div>
      </Card>
    );
  }
  // Bar chart data — top 8 by flagged claims
  const barData = data.slice(0, 8).map(p => ({
    name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    flagged: p.flagged_claims,
    total: p.total_claims,
    score: p.avg_risk_score,
    provider_id: p.provider_id,
  }));
  return (
    <Card className='p-6'>
      {/* Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='h-4 w-4 text-red-500' />
          <h3 className='font-semibold text-gray-900'>Top Flagged Providers</h3>
          <span className='text-xs text-gray-400 ml-1'>(last 30 days)</span>
        </div>
        {/* Toggle: bar chart vs detail table */}
        <div className='flex rounded-md border border-gray-200 overflow-hidden'>
          {(['bar', 'table'] as const).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                chartType === type
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type === 'bar' ? 'Chart' : 'Table'}
            </button>
          ))}
        </div>
      </div>
      {/* ── Bar Chart view ─────────────────────────────────────────── */}
      {chartType === 'bar' && (
        <div>
          <ResponsiveContainer width='100%' height={260}>
            <BarChart
              data={barData}
              layout='vertical'
              margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                horizontal={false}
                stroke='#f3f4f6'
              />
              <XAxis
                type='number'
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type='category'
                dataKey='name'
                width={130}
                tick={{ fontSize: 11, fill: '#374151' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'flagged' ? 'Flagged Claims' : 'Total Claims',
                ]}
              />
              <Bar dataKey='flagged' radius={[0, 3, 3, 0]} maxBarSize={18}>
                {barData.map(entry => (
                  <Cell key={entry.provider_id} fill={riskColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Colour legend */}
          <div className='flex flex-wrap gap-3 mt-3 justify-end'>
            {[
              { label: 'Critical ≥80', color: '#dc2626' },
              { label: 'High ≥60', color: '#ea580c' },
              { label: 'Medium ≥40', color: '#ca8a04' },
              { label: 'Low <40', color: '#16a34a' },
            ].map(l => (
              <div key={l.label} className='flex items-center gap-1'>
                <div
                  className='w-2.5 h-2.5 rounded-sm'
                  style={{ backgroundColor: l.color }}
                />
                <span className='text-xs text-gray-500'>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ── Table view ─────────────────────────────────────────────── */}
      {chartType === 'table' && (
        <div className='space-y-2'>
          {data.map((provider, idx) => {
            const isExpanded = expandedId === provider.provider_id;
            return (
              <div
                key={provider.provider_id}
                className='border border-gray-100 rounded-lg overflow-hidden'
              >
                {/* Row */}
                <button
                  className='w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left'
                  onClick={() =>
                    setExpandedId(isExpanded ? null : provider.provider_id)
                  }
                >
                  {/* Rank badge */}
                  <span
                    className={`flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0
                        ? 'bg-red-100 text-red-700'
                        : idx === 1
                          ? 'bg-orange-100 text-orange-700'
                          : idx === 2
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {/* Name + county */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>
                      {provider.name}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {provider.county ?? 'Unknown county'}
                    </p>
                  </div>
                  {/* Flagged / total */}
                  <div className='flex-none text-right mr-3'>
                    <p className='text-sm font-semibold text-red-600'>
                      {provider.flagged_claims.toLocaleString()}
                      <span className='text-gray-400 font-normal'>
                        /{provider.total_claims.toLocaleString()}
                      </span>
                    </p>
                    <p className='text-xs text-gray-500'>
                      {formatPercentage(provider.fraud_rate)}
                    </p>
                  </div>
                  {/* Risk score badge */}
                  <Badge
                    className={`flex-none text-xs border ${riskBg(provider.avg_risk_score)}`}
                  >
                    {Math.round(provider.avg_risk_score)}
                  </Badge>
                  {/* Expand chevron */}
                  {isExpanded ? (
                    <ChevronUp className='h-4 w-4 text-gray-400 flex-none' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-gray-400 flex-none' />
                  )}
                </button>
                {/* Expanded: sparkline + detail stats + link */}
                {isExpanded && (
                  <div className='px-4 pb-4 border-t border-gray-100 bg-gray-50'>
                    {/* Quick stats row */}
                    <div className='grid grid-cols-3 gap-4 mt-3 mb-1'>
                      <div>
                        <p className='text-xs text-gray-500'>Est. Fraud Loss</p>
                        <p className='text-sm font-semibold text-gray-900'>
                          {formatCurrency(provider.estimated_loss)}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Avg Risk Score</p>
                        <p
                          className='text-sm font-semibold'
                          style={{ color: riskColor(provider.avg_risk_score) }}
                        >
                          {provider.avg_risk_score.toFixed(1)} / 100
                        </p>
                      </div>
                      <div>
                        <p className='text-xs text-gray-500'>Fraud Rate</p>
                        <p className='text-sm font-semibold text-gray-900'>
                          {formatPercentage(provider.fraud_rate)}
                        </p>
                      </div>
                    </div>
                    {/* Provider trend sparkline */}
                    <ProviderTrendPanel providerId={provider.provider_id} />
                    {/* Link to provider detail */}
                    <div className='mt-3 flex justify-end'>
                      <Link
                        href={`/providers/${provider.provider_id}`}
                        className='inline-flex items-center gap-1 text-xs text-blue-600 hover:underline'
                      >
                        View Provider Detail
                        <ExternalLink className='h-3 w-3' />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
