'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useInvestigations } from '@/hooks/queries/useInvestigations';
import { InvestigationFilterParams } from '@/types/investigation';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDateTime } from '@/lib/helpers';
import { Pagination } from '@/components/shared/Pagination';
import Link from 'next/link';
import { FolderOpen, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockInvestigationsService } from '@/services/mockInvestigationsService';

export default function InvestigationsPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    priority: '',
    notes: '',
    targetDate: '',
  });

  const filters: InvestigationFilterParams = {};
  if (status && status !== 'all') filters.status = status as any;
  if (priority && priority !== 'all') filters.priority = priority as any;

  const { data: investigationsResponse, isLoading } = useInvestigations(
    filters,
    page,
    pageSize,
  );

  const handleCreateInvestigation = async () => {
    if (!formData.priority) {
      toast({
        title: 'Error',
        description: 'Please select a priority level',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await mockInvestigationsService.createInvestigation({
        priority: formData.priority as any,
        notes: formData.notes,
        targetDate: formData.targetDate
          ? new Date(formData.targetDate)
          : undefined,
      });

      setCreateDialogOpen(false);
      setFormData({
        priority: '',
        notes: '',
        targetDate: '',
      });
      toast({
        title: 'Success',
        description: 'Investigation created successfully',
      });
    } catch (error) {
      console.error('[v0] Error creating investigation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create investigation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
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
            <Input
              placeholder='Search case number...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
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
                <SelectItem value='in_progress'>In Progress</SelectItem>
                <SelectItem value='pending_review'>Pending Review</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='closed'>Closed</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
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
              ) : !investigationsResponse?.data ||
                investigationsResponse.data.length === 0 ? (
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
                investigationsResponse.data.map(investigation => (
                  <TableRow key={investigation.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium text-blue-600 hover:text-blue-700'>
                      <Link href={`/investigations/${investigation.id}`}>
                        {investigation.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {investigation.investigatorName}
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {investigation.providerName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={investigation.status} size='sm' />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium ${priorityColors[investigation.priority]}`}
                      >
                        {investigation.priority.charAt(0).toUpperCase() +
                          investigation.priority.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full transition-all'
                          style={{ width: `${investigation.progress}%` }}
                        />
                      </div>
                      <p className='text-xs text-gray-600 mt-1'>
                        {investigation.progress}%
                      </p>
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {formatDateTime(investigation.createdAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/investigations/${investigation.id}`}
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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Create New Investigation</DialogTitle>
              <DialogDescription>
                Open a new fraud investigation case for suspicious activity or
                alerts
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Priority Level *
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={v => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select priority level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low</SelectItem>
                    <SelectItem value='medium'>Medium</SelectItem>
                    <SelectItem value='high'>High</SelectItem>
                    <SelectItem value='critical'>Critical</SelectItem>
                  </SelectContent>
                </Select>
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvestigation}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Investigation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
