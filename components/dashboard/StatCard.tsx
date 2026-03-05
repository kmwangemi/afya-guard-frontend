'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  color?: 'blue' | 'red' | 'green' | 'orange' | 'purple';
  isLoading?: boolean; // ← was missing; dashboard passes this on every card
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color = 'blue',
  isLoading = false,
}: StatCardProps) {
  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600 mb-2'>{title}</p>
          {isLoading ? (
            // Skeleton — same height as the real content so layout doesn't shift
            <div className='animate-pulse space-y-2'>
              <div className='h-9 w-28 bg-gray-200 rounded' />
              <div className='h-3 w-36 bg-gray-100 rounded' />
            </div>
          ) : (
            <>
              <p className='text-3xl font-bold text-gray-900'>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change && (
                <p
                  className={`text-xs mt-2 ${
                    change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {change.trend === 'up' ? '↑' : '↓'} {change.value.toFixed(1)}%
                  from last month
                </p>
              )}
            </>
          )}
        </div>
        {/* Icon badge — always visible even while loading */}
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className='h-6 w-6' />
        </div>
      </div>
    </Card>
  );
}
