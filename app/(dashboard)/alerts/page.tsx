'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAlerts } from '@/hooks/queries/useAlerts';
import { AlertFilterParams } from '@/types/alert';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDateTime } from '@/lib/helpers';
import { ALERT_TYPE_LABELS } from '@/lib/constants';
import { Pagination } from '@/components/shared/Pagination';
import Link from 'next/link';
import { Bell, Plus } from 'lucide-react';

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');

  const filters: AlertFilterParams = {};
  if (severity && severity !== 'all') filters.severity = severity as any;
  if (status && status !== 'all') filters.status = status as any;

  const { data: alertsResponse, isLoading } = useAlerts(
    filters,
    page,
    pageSize,
  );

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Alerts</h1>
            <p className='text-gray-600 mt-1'>
              Monitor and manage fraud detection alerts
            </p>
          </div>
        </div>
        {/* Filters */}
        <Card className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Input
              placeholder='Search alerts...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={severity || 'all'}
              onValueChange={v => {
                setSeverity(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All severity levels' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Levels</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status || 'all'}
              onValueChange={v => {
                setStatus(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='open'>Open</SelectItem>
                <SelectItem value='assigned'>Assigned</SelectItem>
                <SelectItem value='investigating'>Investigating</SelectItem>
                <SelectItem value='resolved'>Resolved</SelectItem>
                <SelectItem value='closed'>Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={v => setPageSize(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='25'>25 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        {/* Alerts Table */}
        <Card className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Alert Number</TableHead>
                <TableHead className='font-semibold'>Type</TableHead>
                <TableHead className='font-semibold'>Provider</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='font-semibold'>Severity</TableHead>
                <TableHead className='font-semibold text-right'>
                  Fraud Amount
                </TableHead>
                <TableHead className='font-semibold'>Created</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-20 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
                      Loading alerts...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !alertsResponse?.data || alertsResponse.data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='h-20 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <Bell className='h-8 w-8 text-gray-300' />
                      No alerts found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                alertsResponse.data.map(alert => (
                  <TableRow key={alert.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium text-blue-600 hover:text-blue-700'>
                      <Link href={`/alerts/${alert.id}`}>
                        {alert.alertNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-700'>
                        {ALERT_TYPE_LABELS[alert.type]}
                      </span>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {alert.providerName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={alert.status} size='sm' />
                    </TableCell>
                    <TableCell>
                      <RiskScoreBadge
                        score={alert.riskScore}
                        level={alert.severity}
                        size='sm'
                      />
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(alert.estimatedFraudAmount)}
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {formatDateTime(alert.createdAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/alerts/${alert.id}`}
                        className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        {/* Pagination */}
        {!isLoading && alertsResponse && (
          <Pagination
            page={page}
            totalPages={alertsResponse.pagination.totalPages}
            onPageChange={setPage}
            total={alertsResponse.pagination.total}
            pageSize={pageSize}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
