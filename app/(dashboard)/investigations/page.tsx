'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateInvestigation,
  useInvestigations,
} from '@/hooks/queries/useInvestigations';
import { formatDateTime } from '@/lib/helpers';
import {
  CasePriority,
  CaseStatus,
  InvestigationFilterParams,
} from '@/types/investigation';
import { FolderOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

// Fix 35: UPPERCASE keys matching CasePriority; URGENT replaces critical
const PRIORITY_COLORS: Record<CasePriority, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

// Fix 28: UPPERCASE status labels matching CaseStatus
const STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  CONFIRMED_FRAUD: 'Confirmed Fraud',
  CLEARED: 'Cleared',
  CLOSED: 'Closed',
};

export default function InvestigationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  // Fix 31: search wired to filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fix 30: form now includes claimId + fraudScoreId (required by backend InvestigationCreate)
  const [formData, setFormData] = useState({
    claimId: '',
    fraudScoreId: '',
    priority: '' as CasePriority | '',
    assignedTo: '',
    notes: '',
    targetDate: '',
  });

  const filters: InvestigationFilterParams = {};
  // Fix 31: search now included in filters
  if (search) filters.search = search;
  // Fix 28: UPPERCASE CaseStatus values
  if (status && status !== 'all') filters.status = status as CaseStatus;
  // Fix 29: UPPERCASE CasePriority values; URGENT instead of critical
  if (priority && priority !== 'all')
    filters.priority = priority as CasePriority;

  const { data: investigationsResponse, isLoading } = useInvestigations(
    filters,
    page,
    pageSize,
  );
  // Fix 30: uses hook (invalidates list cache) instead of mockInvestigationsService
  const createInvestigation = useCreateInvestigation();
  const handleCreateInvestigation = async () => {
    // Fix 30: claimId + fraudScoreId are required by InvestigationCreate
    if (!formData.claimId.trim()) {
      toast.error('Claim ID is required.');
      return;
    }
    if (!formData.fraudScoreId.trim()) {
      toast.error('Fraud Score ID is required.');
      return;
    }
    if (!formData.priority) {
      toast.error('Please select a priority level.');
      return;
    }
    try {
      await createInvestigation.mutateAsync({
        claimId: formData.claimId.trim(),
        fraudScoreId: formData.fraudScoreId.trim(),
        priority: formData.priority,
        assignedTo: formData.assignedTo.trim() || undefined,
        notes: formData.notes || undefined,
        targetDate: formData.targetDate || undefined,
      });
      setCreateDialogOpen(false);
      setFormData({
        claimId: '',
        fraudScoreId: '',
        priority: '',
        assignedTo: '',
        notes: '',
        targetDate: '',
      });
      toast.success('Investigation created successfully.');
    } catch (err) {
      console.error('[investigations] create error:', err);
      toast.error('Failed to create investigation.');
    }
  };
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Investigations</h1>
            <p className='text-gray-600 mt-1'>
              Fraud investigation case management and tracking
            </p>
          </div>
          <Button
            className='bg-blue-600 hover:bg-blue-700'
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className='h-4 w-4 mr-2' />
            Create Investigation
          </Button>
        </div>
        {/* Filters */}
        <Card className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {/* Fix 31: search now passed into filters */}
            <Input
              placeholder='Search case number...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {/* Fix 28: UPPERCASE CaseStatus values; removed in_progress/pending_review/completed */}
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
                <SelectItem value='OPEN'>Open</SelectItem>
                <SelectItem value='UNDER_REVIEW'>Under Review</SelectItem>
                <SelectItem value='CONFIRMED_FRAUD'>Confirmed Fraud</SelectItem>
                <SelectItem value='CLEARED'>Cleared</SelectItem>
                <SelectItem value='CLOSED'>Closed</SelectItem>
              </SelectContent>
            </Select>
            {/* Fix 29: UPPERCASE CasePriority values; URGENT replaces critical */}
            <Select
              value={priority || 'all'}
              onValueChange={v => {
                setPriority(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All priorities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Priorities</SelectItem>
                <SelectItem value='LOW'>Low</SelectItem>
                <SelectItem value='MEDIUM'>Medium</SelectItem>
                <SelectItem value='HIGH'>High</SelectItem>
                <SelectItem value='URGENT'>Urgent</SelectItem>
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
        {/* Investigations Table */}
        <Card className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Case Number</TableHead>
                <TableHead className='font-semibold'>Investigator</TableHead>
                <TableHead className='font-semibold'>Provider</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='font-semibold'>Priority</TableHead>
                <TableHead className='font-semibold'>Progress</TableHead>
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
                      Loading investigations...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !investigationsResponse?.data?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='h-20 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <FolderOpen className='h-8 w-8 text-gray-300' />
                      No investigations found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                investigationsResponse.data.map(inv => (
                  <TableRow key={inv.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium text-blue-600 hover:text-blue-700'>
                      {/* Fix 33: was investigation.caseNumber → inv.invNumber */}
                      <Link href={`/investigations/${inv.id}`}>
                        {inv.invNumber}
                      </Link>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {inv.investigatorName ?? '—'}
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {inv.providerName ?? '—'}
                    </TableCell>
                    <TableCell>
                      {/* Fix 28: STATUS_LABELS keyed on UPPERCASE */}
                      <span className='text-sm'>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {/* Fix 35: PRIORITY_COLORS keyed on UPPERCASE */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[inv.priority]}`}
                      >
                        {PRIORITY_LABELS[inv.priority]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all'
                          style={{ width: `${inv.progress}%` }}
                        />
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>
                        {inv.progress}%
                      </p>
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {/* Fix 34: openedAt is ISO string — wrap with new Date() */}
                      {formatDateTime(new Date(inv.openedAt))}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/investigations/${inv.id}`}
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
        {!isLoading && investigationsResponse && (
          <Pagination
            page={page}
            totalPages={investigationsResponse.pagination.totalPages}
            onPageChange={setPage}
            total={investigationsResponse.pagination.total}
            pageSize={pageSize}
          />
        )}
        {/* Create Investigation Dialog */}
        {/* Fix 30: form now collects claimId + fraudScoreId (required by backend) */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Create New Investigation</DialogTitle>
              <DialogDescription>
                Open a new fraud investigation case.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Claim ID *
                </label>
                <Input
                  placeholder='UUID of the claim to investigate'
                  value={formData.claimId}
                  onChange={e =>
                    setFormData({ ...formData, claimId: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Fraud Score ID *
                </label>
                <Input
                  placeholder='UUID of the associated fraud score'
                  value={formData.fraudScoreId}
                  onChange={e =>
                    setFormData({ ...formData, fraudScoreId: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
              {/* Fix 29: UPPERCASE priority values; URGENT replaces critical */}
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Priority Level *
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={v =>
                    setFormData({ ...formData, priority: v as CasePriority })
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select priority level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Low</SelectItem>
                    <SelectItem value='MEDIUM'>Medium</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='URGENT'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Assign To (optional)
                </label>
                <Input
                  placeholder='Analyst user UUID'
                  value={formData.assignedTo}
                  onChange={e =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Initial Notes
                </label>
                <Textarea
                  placeholder='Enter initial notes for this investigation...'
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Target Completion Date
                </label>
                <Input
                  type='date'
                  value={formData.targetDate}
                  onChange={e =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCreateDialogOpen(false)}
                disabled={createInvestigation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvestigation}
                disabled={createInvestigation.isPending}
              >
                {createInvestigation.isPending
                  ? 'Creating...'
                  : 'Create Investigation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
