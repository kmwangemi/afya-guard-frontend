'use client';

import { Card } from '@/components/ui/card';
import type { TrendData } from '@/types/common';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TrendChartProps {
  data?: TrendData[];
}

export function TrendChart({ data = [] }: TrendChartProps) {
  return (
    <Card className='p-6'>
      <h3 className='text-lg font-semibold text-foreground mb-6'>
        Fraud Trend
      </h3>
      {data.length > 0 ? (
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='total_claims'
              stroke='#3b82f6'
              name='Total Claims'
              dot={false}
            />
            <Line
              type='monotone'
              dataKey='flagged_claims'
              stroke='#ef4444'
              name='Flagged Claims'
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className='flex items-center justify-center h-75 text-muted-foreground'>
          No data available
        </div>
      )}
    </Card>
  );
}
