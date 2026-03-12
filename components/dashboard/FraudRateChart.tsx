'use client';

import { Card } from '@/components/ui/card';
import { TrendData } from '@/types/common';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface FraudRateChartProps {
  data: TrendData[];
  isLoading?: boolean;
}

/**
 * Fraud Rate % trend — overlays the daily fraud rate (%) as a line
 * on top of total/flagged volume bars so the reader sees both
 * absolute count AND the rate trend in one glance.
 */
export function FraudRateChart({ data, isLoading }: FraudRateChartProps) {
  if (isLoading) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold text-gray-900 mb-4'>Fraud Rate Trend</h3>
        <div className='h-72 bg-gray-100 rounded animate-pulse' />
      </Card>
    );
  }
  const chartData = data.map(d => ({
    date: d.date.slice(5), // "MM-DD"
    total: d.totalClaims,
    flagged: d.flaggedClaims,
    fraudRatePct: parseFloat((d.fraudRate * 100).toFixed(2)),
  }));
  // Dynamic Y-axis right max — round up to next 5%
  const maxRate = Math.max(...chartData.map(d => d.fraudRatePct), 0);
  const rateMax = Math.ceil(maxRate / 5) * 5 || 10;
  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='font-semibold text-gray-900'>Fraud Rate Trend</h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Volume bars (left axis) vs daily fraud rate % (right axis)
          </p>
        </div>
      </div>
      <ResponsiveContainer width='100%' height={260}>
        <ComposedChart
          data={chartData}
          margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#f3f4f6'
            vertical={false}
          />
          <XAxis
            dataKey='date'
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval='preserveStartEnd'
          />
          {/* Left: claim count */}
          <YAxis
            yAxisId='left'
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          {/* Right: fraud rate % */}
          <YAxis
            yAxisId='right'
            orientation='right'
            tick={{ fontSize: 11, fill: '#ef4444' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
            domain={[0, rateMax]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => {
              if (name === 'fraudRatePct') return [`${value}%`, 'Fraud Rate'];
              if (name === 'flagged')
                return [value.toLocaleString(), 'Flagged'];
              if (name === 'total') return [value.toLocaleString(), 'Total'];
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={value => {
              if (value === 'fraudRatePct') return 'Fraud Rate %';
              if (value === 'flagged') return 'Flagged Claims';
              if (value === 'total') return 'Total Claims';
              return value;
            }}
          />
          {/* Total claims — light blue area */}
          <Area
            yAxisId='left'
            type='monotone'
            dataKey='total'
            fill='#dbeafe'
            stroke='#93c5fd'
            strokeWidth={1}
            dot={false}
            legendType='square'
          />
          {/* Flagged claims — stacked bar */}
          <Bar
            yAxisId='left'
            dataKey='flagged'
            fill='#fca5a5'
            radius={[2, 2, 0, 0]}
            maxBarSize={10}
          />
          {/* Fraud rate line — red, right axis */}
          <Line
            yAxisId='right'
            type='monotone'
            dataKey='fraudRatePct'
            stroke='#ef4444'
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
