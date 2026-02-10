/** biome-ignore-all lint/suspicious/noArrayIndexKey: ignore */
'use client';

import { Card } from '@/components/ui/card';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RiskDistributionChartProps {
  data?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function RiskDistributionChart({
  data = { critical: 0, high: 0, medium: 0, low: 0 },
}: RiskDistributionChartProps) {
  const chartData = [
    { name: 'Critical', value: data.critical },
    { name: 'High', value: data.high },
    { name: 'Medium', value: data.medium },
    { name: 'Low', value: data.low },
  ].filter(item => item.value > 0);

  const COLORS = ['#dc2626', '#ea580c', '#eab308', '#16a34a'];

  return (
    <Card className='p-6'>
      <h3 className='text-lg font-semibold text-foreground mb-6'>
        Risk Distribution
      </h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill='#8884d8'
              dataKey='value'
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className='flex items-center justify-center h-75 text-muted-foreground'>
          No data available
        </div>
      )}
    </Card>
  );
}
