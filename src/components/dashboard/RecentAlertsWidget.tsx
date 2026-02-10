'use client';

import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Alert } from '@/types/alert';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecentAlertsWidgetProps {
  alerts?: Alert[];
  isLoading?: boolean;
}

export function RecentAlertsWidget({
  alerts = [],
  isLoading = false,
}: RecentAlertsWidgetProps) {
  if (isLoading) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-center h-75'>
          <LoadingSpinner />
        </div>
      </Card>
    );
  }
  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold text-foreground'>Recent Alerts</h3>
        <Link href='/dashboard/alerts'>
          <Button variant='ghost' size='sm'>
            View all <ChevronRight className='w-4 h-4' />
          </Button>
        </Link>
      </div>
      {alerts.length > 0 ? (
        <div className='space-y-3'>
          {alerts.slice(0, 5).map(alert => (
            <Link key={alert.id} href={`/dashboard/alerts/${alert.id}`}>
              <div className='flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer'>
                <AlertCircle className='w-5 h-5 mt-0.5 shrink-0 text-orange-500' />
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {alert.alert_type}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatDate(alert.created_at)}
                  </p>
                </div>
                <Badge
                  variant={
                    alert.severity === 'critical' ? 'default' : 'secondary'
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title='No alerts'
          description='All systems are operating normally'
        />
      )}
    </Card>
  );
}
