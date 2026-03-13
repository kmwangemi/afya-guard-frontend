'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAcknowledgeAlert,
  useAlertById,
  useAssignAlert,
  useUpdateAlertStatus,
} from '@/hooks/queries/useAlerts';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { AlertStatus } from '@/types/alert';
import { AlertCircle, ArrowLeft, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Human-readable labels for AlertStatus values
const STATUS_LABELS: Record<AlertStatus, string> = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  INVESTIGATING: 'Investigating',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  EXPIRED: 'Expired',
};

export default function AlertDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;
  // Fix 16: status transitions are driven by alert.availableStatusTransitions from backend
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | ''>('');
  // Fix 18: backend needs a UUID, not a name — using a text input pending real user-list API
  const [assignUserId, setAssignUserId] = useState('');
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const { data: alert, isLoading } = useAlertById(alertId);
  // Fix 17: payload is now { alertId, payload: { status, note } }
  const updateAlertStatus = useUpdateAlertStatus();
  // Fix 18: payload is now { alertId, payload: { userId } }
  const assignAlert = useAssignAlert();
  const acknowledgeAlert = useAcknowledgeAlert();
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center h-96'>
          <LoadingSpinner text='Loading alert details...' />
        </div>
      </DashboardLayout>
    );
  }
  if (!alert) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Alert not found
          </h3>
          <p className='text-gray-600 mt-2'>
            The alert you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()} className='mt-4'>
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  // Fix 17: wrap status in payload object
  const handleStatusChange = async (newStatus: AlertStatus) => {
    try {
      await updateAlertStatus.mutateAsync({
        alertId,
        payload: { status: newStatus, note: statusNote || undefined },
      });
      setSelectedStatus(newStatus);
      setStatusNote('');
      toast.success('Status updated successfully.');
    } catch (err) {
      console.error('[alerts] status update error:', err);
      toast.error('Failed to update status.');
    }
  };
  // Fix 18: send { userId } instead of { investigatorId, investigatorName }
  const handleAssignAlert = async () => {
    if (!assignUserId.trim()) return;
    try {
      await assignAlert.mutateAsync({
        alertId,
        payload: { userId: assignUserId.trim() },
      });
      setShowAssignPanel(false);
      setAssignUserId('');
      toast.success('Alert assigned successfully.');
    } catch (err) {
      console.error('[alerts] assign error:', err);
      toast.error('Failed to assign alert.');
    }
  };
  const handleAcknowledge = async () => {
    try {
      await acknowledgeAlert.mutateAsync({ alertId });
      toast.success('Alert acknowledged successfully.');
    } catch (err) {
      console.error('[alerts] acknowledge error:', err);
      toast.error('Failed to acknowledge alert.');
    }
  };
  // Aliases for cleaner JSX
  const summary = alert.alertSummary;
  const relatedClaim = alert.relatedClaim;
  const fraud = alert.fraudAnalysis;
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.back()}
              className='h-9 w-9 p-0'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {alert.alertNumber}
              </h1>
              {/* Fix 1: was alert.title — backend field is alert.subtitle */}
              <p className='text-gray-600 mt-1'>{alert.subtitle}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <Share2 className='h-4 w-4 mr-2' />
              Share
            </Button>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Alert Summary */}
            <Card className='p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Alert Summary
              </h2>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Type</p>
                  {/* Fix 2: was alert.type.replace(/_/g," ") — use typeDisplay from alertSummary */}
                  <p className='font-medium text-gray-900'>
                    {summary.typeDisplay}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Severity</p>
                  <RiskScoreBadge
                    score={fraud.riskScorePercentage ?? 0}
                    level={summary.severity}
                    size='sm'
                  />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <StatusBadge status={summary.status} type='alert' size='sm' />
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Created</p>
                  {/* Fix 6: createdAt is now ISO string — wrap with new Date() */}
                  <p className='font-medium text-gray-900'>
                    {formatDate(new Date(summary.createdAt))}
                  </p>
                </div>
              </div>
            </Card>
            {/* Related Claim */}
            {/* Fix 7–10: all fields moved to relatedClaim nested object */}
            {relatedClaim && (
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Related Claim
                </h2>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center pb-3 border-b'>
                    <span className='text-sm text-gray-600'>Claim Number</span>
                    <Link
                      href={`/claims/${relatedClaim.claimId}`}
                      className='font-medium text-blue-600 hover:text-blue-700'
                    >
                      {relatedClaim.shaClaimId}
                    </Link>
                  </div>
                  {relatedClaim.providerName && (
                    <div className='flex justify-between items-center pb-3 border-b'>
                      <span className='text-sm text-gray-600'>Provider</span>
                      <Link
                        href={`/providers/${relatedClaim.providerId}`}
                        className='font-medium text-blue-600 hover:text-blue-700'
                      >
                        {relatedClaim.providerName}
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {/* Description — Fix 11: null guard */}
            {alert.description && (
              <Card className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  Description
                </h2>
                <p className='text-gray-700'>{alert.description}</p>
              </Card>
            )}
            {/* Fraud Analysis — Fix 12: nested fraudAnalysis fields */}
            <Card className='p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Fraud Analysis
              </h2>
              <div className='space-y-4'>
                <div className='bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200'>
                  <p className='text-sm text-gray-600 mb-1'>
                    Estimated Fraud Amount
                  </p>
                  <p className='text-2xl font-bold text-red-600'>
                    {fraud.estimatedFraudAmount != null
                      ? formatCurrency(fraud.estimatedFraudAmount)
                      : 'N/A'}
                  </p>
                </div>
                <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200'>
                  <p className='text-sm text-gray-600 mb-1'>Risk Score</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {fraud.riskScorePercentage != null
                      ? `${fraud.riskScorePercentage.toFixed(1)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Quick Actions */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                {/* Acknowledge button — only when OPEN */}
                {summary.status === 'OPEN' && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleAcknowledge}
                    disabled={acknowledgeAlert.isPending}
                  >
                    {acknowledgeAlert.isPending
                      ? 'Acknowledging...'
                      : 'Acknowledge'}
                  </Button>
                )}
                {/* Fix 16: status options driven by availableStatusTransitions from backend */}
                {alert.availableStatusTransitions.length > 0 && (
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium text-gray-700'>
                      Update Status
                    </label>
                    <Input
                      placeholder='Optional note...'
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      className='text-sm'
                    />
                    <Select
                      value={selectedStatus || summary.status}
                      onValueChange={v => handleStatusChange(v as AlertStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {alert.availableStatusTransitions.map(s => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* Fix 18: assign panel uses userId UUID input */}
                <Button
                  onClick={() => setShowAssignPanel(p => !p)}
                  className='w-full bg-blue-600 hover:bg-blue-700'
                >
                  Assign to Investigator
                </Button>
                {showAssignPanel && (
                  <div className='space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200'>
                    <p className='text-xs text-blue-800 font-medium'>
                      Enter investigator user ID
                    </p>
                    <Input
                      placeholder='User UUID...'
                      value={assignUserId}
                      onChange={e => setAssignUserId(e.target.value)}
                      className='text-sm'
                    />
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={handleAssignAlert}
                        disabled={!assignUserId.trim() || assignAlert.isPending}
                        className='flex-1 bg-blue-600 hover:bg-blue-700'
                      >
                        {assignAlert.isPending ? 'Assigning...' : 'Confirm'}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setShowAssignPanel(false);
                          setAssignUserId('');
                        }}
                        className='flex-1'
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            {/* Assigned To — Fix 13+14: alert.assignedTo is now AssignedAnalyst object */}
            {alert.assignedTo && (
              <Card className='p-6 bg-blue-50 border-blue-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  Assigned To
                </h3>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center'>
                    <span className='text-sm font-semibold text-blue-700'>
                      {alert.assignedTo.avatarInitial}
                    </span>
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>
                      {alert.assignedTo.fullName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {alert.assignedTo.role ?? 'Investigator'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Timeline
              </h3>
              <div className='space-y-3 text-sm'>
                {alert.timeline.length === 0 ? (
                  <p className='text-gray-500 text-sm'>
                    No timeline events yet.
                  </p>
                ) : (
                  alert.timeline.map((event, i) => (
                    <div key={i} className='flex gap-3'>
                      <div
                        className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                          event.label.toLowerCase().includes('resolv')
                            ? 'bg-green-600'
                            : event.label.toLowerCase().includes('escalat')
                              ? 'bg-red-600'
                              : 'bg-blue-600'
                        }`}
                      />
                      <div>
                        <p className='font-medium text-gray-900'>
                          {event.label}
                        </p>
                        <p className='text-gray-600'>
                          {formatDate(new Date(event.timestamp))}
                        </p>
                        {event.note && (
                          <p className='text-gray-500 italic mt-0.5'>
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
