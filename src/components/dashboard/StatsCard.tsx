import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-sm text-muted-foreground font-medium'>{title}</p>
          <p className='text-3xl font-bold text-foreground mt-2'>{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${trend.isPositive ? 'text-red-600' : 'text-green-600'}`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last
              month
            </p>
          )}
        </div>
        <div className='p-3 bg-blue-100 rounded-lg'>
          <Icon className='w-6 h-6 text-blue-600' />
        </div>
      </div>
    </Card>
  );
}
