'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
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
  useCloseInvestigation,
  useInvestigationById,
  useUpdateInvestigationProgress,
  useUpdateInvestigationStatus,
} from '@/hooks/queries/useInvestigations';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers';
import { CasePriority, CaseStatus } from '@/types/investigation';
import { AlertCircle, ChevronLeft, FileText, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Fix 26: keyed on UPPERCASE backend values
const STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  CONFIRMED_FRAUD: 'Confirmed Fraud',
  CLEARED: 'Cleared',
  CLOSED: 'Closed',
};

const STATUS_COLORS: Record<CaseStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  CONFIRMED_FRAUD: 'bg-red-100 text-red-800',
  CLEARED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

// Fix 2+26: URGENT replaces CRITICAL
const PRIORITY_LABELS: Record<CasePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_COLORS: Record<CasePriority, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

// Terminal statuses that require a resolution summary
const TERMINAL_STATUSES: CaseStatus[] = [
  'CONFIRMED_FRAUD',
  'CLEARED',
  'CLOSED',
];

export default function InvestigationDetailPage() {
  const params = useParams();
  const investigationId = params.id as string;
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [updateProgressOpen, setUpdateProgressOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus | ''>('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [estimatedLoss, setEstimatedLoss] = useState('');
  const [newProgress, setNewProgress] = useState(0);
  const [findings, setFindings] = useState('');
  const [closeStatus, setCloseStatus] = useState<
    'CONFIRMED_FRAUD' | 'CLEARED' | 'CLOSED' | ''
  >('');
  const [closeResolution, setCloseResolution] = useState('');
  const [closeLoss, setCloseLoss] = useState('');
  // Fix 23: useInvestigationById hook replaces useEffect + mock
  const { data: inv, isLoading } = useInvestigationById(investigationId);
  const updateStatus = useUpdateInvestigationStatus();
  const updateProgress = useUpdateInvestigationProgress();
  const closeInvestigation = useCloseInvestigation();
  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status.');
      return;
    }
    const isTerminal = TERMINAL_STATUSES.includes(newStatus as CaseStatus);
    if (isTerminal && !resolutionSummary.trim()) {
      toast.error('Resolution summary is required for this status.');
      return;
    }
    try {
      // Fix 18: payload shape { status, resolutionSummary?, estimatedLoss? }
      await updateStatus.mutateAsync({
        investigationId,
        payload: {
          status: newStatus as CaseStatus,
          resolutionSummary: resolutionSummary || undefined,
          estimatedLoss: estimatedLoss ? parseFloat(estimatedLoss) : undefined,
        },
      });
      setUpdateStatusOpen(false);
      setNewStatus('');
      setResolutionSummary('');
      setEstimatedLoss('');
      toast.success('Status updated.');
    } catch (err) {
      console.error('[investigations] status error:', err);
      toast.error('Failed to update status.');
    }
  };
  const handleUpdateProgress = async () => {
    try {
      // Fix 19: payload shape { progress, findings? }
      await updateProgress.mutateAsync({
        investigationId,
        payload: { progress: newProgress, findings: findings || undefined },
      });
      setUpdateProgressOpen(false);
      setFindings('');
      toast.success('Progress updated.');
    } catch (err) {
      console.error('[investigations] progress error:', err);
      toast.error('Failed to update progress.');
    }
  };
  const handleClose = async () => {
    if (!closeStatus || !closeResolution.trim()) {
      toast.error('Please select an outcome and provide a resolution summary.');
      return;
    }
    try {
      // Fix 21: delegates to updateStatus with terminal status via closeInvestigation
      await closeInvestigation.mutateAsync({
        investigationId,
        status: closeStatus,
        resolutionSummary: closeResolution,
        estimatedLoss: closeLoss ? parseFloat(closeLoss) : undefined,
      });
      setCloseOpen(false);
      setCloseStatus('');
      setCloseResolution('');
      setCloseLoss('');
      toast.success('Investigation closed.');
    } catch (err) {
      console.error('[investigations] close error:', err);
      toast.error('Failed to close investigation.');
    }
  };
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-96'>
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }
  if (!inv) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Investigation not found
          </h3>
        </div>
      </DashboardLayout>
    );
  }
  const canClose = inv.quickActions.canClose && inv.status !== 'CLOSED';
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/investigations'>
              <Button variant='ghost' size='sm'>
                <ChevronLeft className='h-4 w-4 mr-1' />
                Back
              </Button>
            </Link>
            <div>
              {/* Fix 24: was investigation.caseNumber → inv.invNumber */}
              <h1 className='text-3xl font-bold text-gray-900'>
                {inv.invNumber}
              </h1>
              {/* Fix 24: was investigation.providerName → inv.subtitle */}
              <p className='text-gray-600 mt-1'>{inv.subtitle}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setUpdateStatusOpen(true);
              }}
            >
              Update Status
            </Button>
            {inv.quickActions.canUpdateProgress && (
              <Button
                variant='outline'
                onClick={() => {
                  setNewProgress(inv.statCards.progress);
                  setUpdateProgressOpen(true);
                }}
              >
                Update Progress
              </Button>
            )}
            {canClose && (
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={() => setCloseOpen(true)}
              >
                Close Investigation
              </Button>
            )}
          </div>
        </div>
        {/* Stat Cards — Fix 24: all fields from statCards nested object */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Status</p>
            {/* Fix 26: STATUS_COLORS keyed on UPPERCASE */}
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${STATUS_COLORS[inv.statCards.status]}`}
            >
              {STATUS_LABELS[inv.statCards.status]}
            </div>
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Priority</p>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${PRIORITY_COLORS[inv.statCards.priority]}`}
            >
              {PRIORITY_LABELS[inv.statCards.priority]}
            </div>
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Days Open</p>
            <p className='text-2xl font-bold text-gray-900'>
              {inv.statCards.daysOpen}
            </p>
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Progress</p>
            <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
              <div
                className='bg-blue-600 h-2 rounded-full transition-all'
                style={{ width: `${inv.statCards.progress}%` }}
              />
            </div>
            <p className='text-sm font-semibold text-gray-900'>
              {inv.statCards.progress}%
            </p>
          </Card>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Investigation Details — Fix 24: all from investigationDetails nested object */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Investigation Details
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Investigator</p>
                  <p className='font-semibold text-gray-900'>
                    {inv.investigationDetails.investigatorName ?? 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Related Claim</p>
                  <p className='font-semibold text-gray-900'>
                    {inv.investigationDetails.relatedClaim ?? '—'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Created</p>
                  <p className='font-semibold text-gray-900'>
                    {formatDate(new Date(inv.investigationDetails.createdAt))}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Target Date</p>
                  <p className='font-semibold text-gray-900'>
                    {inv.investigationDetails.targetDate
                      ? formatDate(
                          new Date(inv.investigationDetails.targetDate),
                        )
                      : '—'}
                  </p>
                </div>
                {inv.investigationDetails.closedAt && (
                  <div>
                    <p className='text-sm text-gray-600'>Closed</p>
                    <p className='font-semibold text-gray-900'>
                      {formatDate(new Date(inv.investigationDetails.closedAt))}
                    </p>
                  </div>
                )}
              </div>
            </Card>
            {/* Findings */}
            {inv.findings && (
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Findings
                </h3>
                <p className='text-gray-700'>{inv.findings}</p>
              </Card>
            )}
            {/* Timeline — Fix 24: { event, actor, note, timestamp } shape */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Timeline
              </h3>
              <div className='space-y-4'>
                {inv.timeline.length === 0 ? (
                  <p className='text-gray-500 text-sm'>No events yet.</p>
                ) : (
                  inv.timeline.map((entry, idx) => (
                    <div
                      key={idx}
                      className='flex gap-4 pb-4 border-b last:border-b-0'
                    >
                      <div className='flex flex-col items-center'>
                        <div className='w-3 h-3 rounded-full bg-purple-600 mt-2' />
                      </div>
                      <div className='flex-1'>
                        <p className='font-semibold text-gray-900'>
                          {entry.event}
                        </p>
                        {entry.actor && (
                          <p className='text-sm text-gray-600'>{entry.actor}</p>
                        )}
                        {entry.note && (
                          <p className='text-sm text-gray-700 mt-1'>
                            {entry.note}
                          </p>
                        )}
                        <p className='text-xs text-gray-500 mt-1'>
                          {formatDateTime(new Date(entry.timestamp))}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            {/* Evidence — Fix 24: { fileName, fileType, uploadedBy, uploadedAt } */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Evidence
              </h3>
              {inv.evidence.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-semibold'>File Name</TableHead>
                      <TableHead className='font-semibold'>Type</TableHead>
                      <TableHead className='font-semibold'>
                        Uploaded By
                      </TableHead>
                      <TableHead className='font-semibold'>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inv.evidence.map(ev => (
                      <TableRow key={ev.id}>
                        <TableCell className='flex items-center gap-2'>
                          <FileText className='h-4 w-4 text-gray-400' />
                          <a
                            href={ev.fileUrl ?? '#'}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            {ev.fileName}
                          </a>
                        </TableCell>
                        <TableCell>{ev.fileType.toUpperCase()}</TableCell>
                        <TableCell>{ev.uploadedBy ?? '—'}</TableCell>
                        <TableCell>
                          {ev.uploadedAt
                            ? formatDate(new Date(ev.uploadedAt))
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className='text-gray-500'>No evidence uploaded yet.</p>
              )}
              <Button className='mt-4' variant='outline'>
                <Upload className='h-4 w-4 mr-2' />
                Upload Evidence
              </Button>
            </Card>
          </div>
          {/* Right Column */}
          <div className='space-y-6'>
            {/* Summary — Fix 24: from inv.summary */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Summary
              </h3>
              <div className='space-y-4'>
                {inv.summary.alertNumber && (
                  <div>
                    <p className='text-xs text-gray-600 mb-1'>Alert Number</p>
                    <p className='text-sm font-semibold text-gray-900'>
                      {inv.summary.alertNumber}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-xs text-gray-600 mb-1'>Claim Number</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {inv.summary.claimNumber ?? '—'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600 mb-1'>Provider</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {inv.summary.providerName ?? '—'}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-600 mb-1'>Investigator</p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {inv.summary.investigatorName ?? 'Unassigned'}
                  </p>
                </div>
              </div>
            </Card>
            {/* Resolution — Fix 3: no InvestigationOutcome; use resolutionSummary + estimatedLoss */}
            {(inv.resolutionSummary || inv.estimatedLoss) && (
              <Card className='p-6 border-green-200 bg-green-50'>
                <h3 className='text-lg font-semibold text-green-900 mb-4'>
                  Resolution
                </h3>
                <div className='space-y-3'>
                  <div>
                    <p className='text-sm text-green-700'>Outcome</p>
                    <p className='font-semibold text-green-900'>
                      {STATUS_LABELS[inv.status]}
                    </p>
                  </div>
                  {inv.resolutionSummary && (
                    <div>
                      <p className='text-sm text-green-700'>Summary</p>
                      <p className='text-sm text-green-900'>
                        {inv.resolutionSummary}
                      </p>
                    </div>
                  )}
                  {inv.estimatedLoss != null && (
                    <div>
                      <p className='text-sm text-red-700'>Estimated Loss</p>
                      <p className='font-semibold text-red-900'>
                        {formatCurrency(inv.estimatedLoss)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
        {/* Update Status Dialog — Fix 25: UPPERCASE values from availableStatusTransitions */}
        <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Investigation Status</DialogTitle>
              <DialogDescription>
                Change the status of this investigation.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Select
                value={newStatus}
                onValueChange={v => setNewStatus(v as CaseStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select new status' />
                </SelectTrigger>
                <SelectContent>
                  {inv.quickActions.availableStatusTransitions.map(s => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newStatus &&
                TERMINAL_STATUSES.includes(newStatus as CaseStatus) && (
                  <>
                    <div>
                      <label className='text-sm font-medium text-gray-700'>
                        Resolution Summary *
                      </label>
                      <Textarea
                        placeholder='Required for this status...'
                        value={resolutionSummary}
                        onChange={e => setResolutionSummary(e.target.value)}
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-700'>
                        Estimated Loss (KES)
                      </label>
                      <Input
                        type='number'
                        placeholder='Optional'
                        value={estimatedLoss}
                        onChange={e => setEstimatedLoss(e.target.value)}
                        className='mt-1'
                      />
                    </div>
                  </>
                )}
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setUpdateStatusOpen(false)}
                disabled={updateStatus.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Update Progress Dialog — Fix 19: uses findings not notes */}
        <Dialog open={updateProgressOpen} onOpenChange={setUpdateProgressOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Investigation Progress</DialogTitle>
              <DialogDescription>
                Update the completion percentage and analyst findings.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Progress (%)
                </label>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  value={newProgress}
                  onChange={e => setNewProgress(parseInt(e.target.value))}
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Findings
                </label>
                <Textarea
                  placeholder='Update analyst findings narrative...'
                  value={findings}
                  onChange={e => setFindings(e.target.value)}
                  className='mt-1'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setUpdateProgressOpen(false)}
                disabled={updateProgress.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateProgress}
                disabled={updateProgress.isPending}
              >
                {updateProgress.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Close Dialog — Fix 21: uses terminal CaseStatus + resolutionSummary */}
        <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Investigation</DialogTitle>
              <DialogDescription>
                Finalise the investigation with an outcome and resolution
                summary.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Outcome *
                </label>
                <Select
                  value={closeStatus}
                  onValueChange={v => setCloseStatus(v as typeof closeStatus)}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select outcome' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CONFIRMED_FRAUD'>
                      Confirmed Fraud
                    </SelectItem>
                    <SelectItem value='CLEARED'>Cleared</SelectItem>
                    <SelectItem value='CLOSED'>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Resolution Summary *
                </label>
                <Textarea
                  placeholder='Required: describe the outcome...'
                  value={closeResolution}
                  onChange={e => setCloseResolution(e.target.value)}
                  className='mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Estimated Loss (KES)
                </label>
                <Input
                  type='number'
                  placeholder='Optional'
                  value={closeLoss}
                  onChange={e => setCloseLoss(e.target.value)}
                  className='mt-1'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setCloseOpen(false)}
                disabled={closeInvestigation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClose}
                disabled={closeInvestigation.isPending}
              >
                {closeInvestigation.isPending
                  ? 'Closing...'
                  : 'Close Investigation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
