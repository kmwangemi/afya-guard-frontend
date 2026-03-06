'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useLogs } from '@/hooks/queries/useLogs';
import { formatDateTime } from '@/lib/helpers';
import {
  AuditAction,
  AuditEntityType,
  AuditLogEntry,
  LogFilterParams,
} from '@/types/log';
import { Activity, Eye, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';

// ─── Action category colours ──────────────────────────────────────────────────

const ACTION_COLORS: Partial<Record<AuditAction, string>> = {
  LOGIN: 'bg-green-100 text-green-800',
  LOGOUT: 'bg-gray-100 text-gray-700',
  TOKEN_REFRESHED: 'bg-gray-100 text-gray-700',
  PASSWORD_CHANGED: 'bg-yellow-100 text-yellow-800',
  USER_CREATED: 'bg-blue-100 text-blue-800',
  USER_UPDATED: 'bg-blue-100 text-blue-800',
  USER_DEACTIVATED: 'bg-red-100 text-red-800',
  ROLE_ASSIGNED: 'bg-purple-100 text-purple-800',
  ROLE_REMOVED: 'bg-purple-100 text-purple-800',
  CLAIM_INGESTED: 'bg-indigo-100 text-indigo-800',
  CLAIM_STATUS_UPDATED: 'bg-indigo-100 text-indigo-800',
  CLAIM_SCORED: 'bg-indigo-100 text-indigo-800',
  SCORE_OVERRIDDEN: 'bg-orange-100 text-orange-800',
  CASE_CREATED: 'bg-blue-100 text-blue-800',
  CASE_ASSIGNED: 'bg-blue-100 text-blue-800',
  CASE_STATUS_UPDATED: 'bg-yellow-100 text-yellow-800',
  CASE_NOTE_ADDED: 'bg-gray-100 text-gray-700',
  CASE_CLOSED: 'bg-green-100 text-green-800',
  RULE_CREATED: 'bg-purple-100 text-purple-800',
  RULE_UPDATED: 'bg-purple-100 text-purple-800',
  RULE_TOGGLED: 'bg-purple-100 text-purple-800',
  MODEL_REGISTERED: 'bg-indigo-100 text-indigo-800',
  MODEL_DEPLOYED: 'bg-red-100 text-red-800',
};

// Group actions for the filter dropdown
const ACTION_GROUPS: { label: string; actions: AuditAction[] }[] = [
  {
    label: 'Auth',
    actions: ['LOGIN', 'LOGOUT', 'TOKEN_REFRESHED', 'PASSWORD_CHANGED'],
  },
  {
    label: 'Users',
    actions: [
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DEACTIVATED',
      'ROLE_ASSIGNED',
      'ROLE_REMOVED',
    ],
  },
  {
    label: 'Claims',
    actions: [
      'CLAIM_INGESTED',
      'CLAIM_STATUS_UPDATED',
      'FEATURES_COMPUTED',
      'CLAIM_SCORED',
      'SCORE_OVERRIDDEN',
    ],
  },
  {
    label: 'Cases',
    actions: [
      'CASE_CREATED',
      'CASE_ASSIGNED',
      'CASE_STATUS_UPDATED',
      'CASE_NOTE_ADDED',
      'CASE_CLOSED',
    ],
  },
  {
    label: 'Admin',
    actions: [
      'RULE_CREATED',
      'RULE_UPDATED',
      'RULE_TOGGLED',
      'MODEL_REGISTERED',
      'MODEL_DEPLOYED',
    ],
  },
];

const ENTITY_TYPES: AuditEntityType[] = [
  'Claim',
  'FraudCase',
  'FraudAlert',
  'User',
  'FraudRule',
  'ModelVersion',
  'FraudReport',
];

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const filters: LogFilterParams = {};
  if (filterAction && filterAction !== 'all')
    filters.action = filterAction as AuditAction;
  if (filterEntityType && filterEntityType !== 'all')
    filters.entityType = filterEntityType;
  if (filterUserId.trim()) filters.userId = filterUserId.trim();
  if (filterFromDate) filters.fromDate = new Date(filterFromDate).toISOString();
  if (filterToDate) filters.toDate = new Date(filterToDate).toISOString();
  const {
    data: logsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useLogs(filters, page, pageSize);
  const handleClearFilters = () => {
    setFilterAction('');
    setFilterEntityType('');
    setFilterUserId('');
    setFilterFromDate('');
    setFilterToDate('');
    setPage(1);
  };
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
              <Shield className='h-7 w-7 text-gray-700' />
              Audit Logs
            </h1>
            <p className='text-gray-600 mt-1'>
              Immutable system-wide activity trail — admin access only
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
        {/* Summary cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card className='p-4'>
            <p className='text-sm text-gray-500 mb-1'>Total Entries</p>
            <p className='text-2xl font-bold text-gray-900'>
              {isLoading
                ? '—'
                : (logsResponse?.pagination.total ?? 0).toLocaleString()}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-500 mb-1'>This Page</p>
            <p className='text-2xl font-bold text-gray-900'>
              {isLoading ? '—' : (logsResponse?.data.length ?? 0)}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-500 mb-1'>Auto-refresh</p>
            <p className='text-sm font-medium text-green-700 mt-1 flex items-center gap-1'>
              <Activity className='h-4 w-4' /> Every 30s
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-500 mb-1'>Access</p>
            <p className='text-sm font-medium text-purple-700 mt-1'>
              Admin only
            </p>
          </Card>
        </div>
        {/* Filters */}
        <Card className='p-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3'>
            {/* Action filter */}
            <Select
              value={filterAction || 'all'}
              onValueChange={v => {
                setFilterAction(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All actions' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Actions</SelectItem>
                {ACTION_GROUPS.map(group => (
                  <div key={group.label}>
                    <div className='px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                      {group.label}
                    </div>
                    {group.actions.map(a => (
                      <SelectItem key={a} value={a}>
                        {a.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {/* Entity type filter */}
            <Select
              value={filterEntityType || 'all'}
              onValueChange={v => {
                setFilterEntityType(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All entities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Entity Types</SelectItem>
                {ENTITY_TYPES.map(e => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* User ID search */}
            <Input
              placeholder='User ID (UUID)...'
              value={filterUserId}
              onChange={e => {
                setFilterUserId(e.target.value);
                setPage(1);
              }}
            />
            {/* Date range */}
            <Input
              type='datetime-local'
              value={filterFromDate}
              onChange={e => {
                setFilterFromDate(e.target.value);
                setPage(1);
              }}
              title='From date'
            />
            <Input
              type='datetime-local'
              value={filterToDate}
              onChange={e => {
                setFilterToDate(e.target.value);
                setPage(1);
              }}
              title='To date'
            />
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
          {(filterAction ||
            filterEntityType ||
            filterUserId ||
            filterFromDate ||
            filterToDate) && (
            <div className='mt-3 flex justify-end'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClearFilters}
                className='text-gray-500'
              >
                Clear all filters
              </Button>
            </div>
          )}
        </Card>
        {/* Logs Table */}
        <Card className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Timestamp</TableHead>
                <TableHead className='font-semibold'>User</TableHead>
                <TableHead className='font-semibold'>Action</TableHead>
                <TableHead className='font-semibold'>Entity Type</TableHead>
                <TableHead className='font-semibold'>Entity ID</TableHead>
                <TableHead className='font-semibold'>IP Address</TableHead>
                <TableHead className='text-right font-semibold'>
                  Details
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-20 text-center'>
                    <div className='flex items-center justify-center gap-2 text-gray-500'>
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
                      Loading audit logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !logsResponse?.data?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='h-20 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <Activity className='h-8 w-8 text-gray-300' />
                      No log entries found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logsResponse.data.map(entry => (
                  <TableRow
                    key={entry.id}
                    className='hover:bg-gray-50 font-mono text-xs'
                  >
                    <TableCell className='text-gray-700 whitespace-nowrap'>
                      {formatDateTime(new Date(entry.performedAt))}
                    </TableCell>
                    <TableCell>
                      {entry.userFullName ? (
                        <div>
                          <p className='font-medium text-gray-900 font-sans text-sm'>
                            {entry.userFullName}
                          </p>
                          <p className='text-gray-400 text-xs'>
                            {entry.userEmail}
                          </p>
                        </div>
                      ) : (
                        <span className='text-gray-400 italic font-sans'>
                          System
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs font-mono ${ACTION_COLORS[entry.action] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {entry.action}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-gray-600'>
                      {entry.entityType ?? (
                        <span className='text-gray-300'>—</span>
                      )}
                    </TableCell>
                    <TableCell
                      className='text-gray-500 max-w-[140px] truncate'
                      title={entry.entityId ?? ''}
                    >
                      {entry.entityId ? (
                        entry.entityId.split('-')[0] + '…'
                      ) : (
                        <span className='text-gray-300'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-gray-500'>
                      {entry.ipAddress ?? (
                        <span className='text-gray-300'>—</span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSelectedEntry(entry);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        {/* Pagination */}
        {!isLoading && logsResponse && (
          <Pagination
            page={page}
            totalPages={logsResponse.pagination.totalPages}
            onPageChange={setPage}
            total={logsResponse.pagination.total}
            pageSize={pageSize}
          />
        )}
        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 font-mono'>
                <Badge
                  className={`${ACTION_COLORS[selectedEntry?.action as AuditAction] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {selectedEntry?.action}
                </Badge>
                <span className='text-sm font-normal text-gray-500'>
                  {selectedEntry &&
                    formatDateTime(new Date(selectedEntry.performedAt))}
                </span>
              </DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className='space-y-4 text-sm'>
                <div className='grid grid-cols-2 gap-4'>
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-1'>User</p>
                    <p className='font-medium'>
                      {selectedEntry.userFullName ?? 'System'}
                    </p>
                    {selectedEntry.userEmail && (
                      <p className='text-gray-500 text-xs'>
                        {selectedEntry.userEmail}
                      </p>
                    )}
                  </Card>
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-1'>Entity</p>
                    <p className='font-medium'>
                      {selectedEntry.entityType ?? '—'}
                    </p>
                    <p className='text-gray-500 text-xs font-mono truncate'>
                      {selectedEntry.entityId ?? '—'}
                    </p>
                  </Card>
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-1'>IP Address</p>
                    <p className='font-mono'>
                      {selectedEntry.ipAddress ?? '—'}
                    </p>
                  </Card>
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-1'>Log ID</p>
                    <p className='font-mono text-xs truncate'>
                      {selectedEntry.id}
                    </p>
                  </Card>
                </div>
                {selectedEntry.userAgent && (
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-1'>User Agent</p>
                    <p className='text-gray-700 text-xs break-all'>
                      {selectedEntry.userAgent}
                    </p>
                  </Card>
                )}
                {Object.keys(selectedEntry.metadata).length > 0 && (
                  <Card className='p-3'>
                    <p className='text-xs text-gray-500 mb-2'>Metadata</p>
                    <pre className='text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap'>
                      {JSON.stringify(selectedEntry.metadata, null, 2)}
                    </pre>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
