'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  useApproveClaim,
  useAssignClaimToInvestigator,
  useClaimAnalysis,
  useClaimById,
  useFlagClaimForInvestigation,
  useRejectClaim,
} from '@/hooks/queries/useClaims';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  maskPatientId,
} from '@/lib/helpers';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Download,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ClaimDetailPage() {
  const params = useParams();
  const claimId = params.id as string;

  const [showActionModal, setShowActionModal] = useState<
    'approve' | 'reject' | 'investigate' | 'assign' | 'share' | null
  >(null);
  const [actionNotes, setActionNotes] = useState('');
  const [selectedInvestigator, setSelectedInvestigator] = useState('');
  const [investigationType, setInvestigationType] = useState('suspected_fraud');
  const [shareEmail, setShareEmail] = useState('');

  const { data: claim, isLoading: claimLoading } = useClaimById(claimId);
  const { data: analysis, isLoading: analysisLoading } =
    useClaimAnalysis(claimId);
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();
  const flagForInvestigation = useFlagClaimForInvestigation();
  const assignToInvestigator = useAssignClaimToInvestigator();

  const isLoading = claimLoading || analysisLoading;

  const handleApproveClaim = async () => {
    try {
      await approveClaim.mutateAsync({ claimId, notes: actionNotes });
      setShowActionModal(null);
      setActionNotes('');
    } catch (err) {
      console.error('[claims] approve error:', err);
    }
  };

  const handleRejectClaim = async () => {
    try {
      await rejectClaim.mutateAsync({ claimId, reason: actionNotes });
      setShowActionModal(null);
      setActionNotes('');
    } catch (err) {
      console.error('[claims] reject error:', err);
    }
  };

  const handleFlagForInvestigation = async () => {
    try {
      await flagForInvestigation.mutateAsync({ claimId, investigationType });
      setShowActionModal(null);
      setInvestigationType('suspected_fraud');
    } catch (err) {
      console.error('[claims] flag error:', err);
    }
  };

  const handleAssignInvestigator = async () => {
    if (!selectedInvestigator) return;
    try {
      await assignToInvestigator.mutateAsync({
        claimId,
        investigatorId: selectedInvestigator,
        investigatorName: selectedInvestigator,
      });
      setShowActionModal(null);
      setSelectedInvestigator('');
    } catch (err) {
      console.error('[claims] assign error:', err);
    }
  };

  const handleDownloadClaim = () => {
    if (!claim) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            id: claim.id,
            claimNumber: claim.claimNumber,
            status: claim.status,
            providerName: claim.providerName,
            patientId: maskPatientId(claim.patientId),
            amount: claim.amount,
            createdAt: claim.createdAt,
            lastUpdated: claim.updatedAt,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `claim-${claim.claimNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareClaim = () => {
    if (!shareEmail.trim()) return;
    // TODO: wire up share API
    console.log('[claims] sharing to:', shareEmail);
    setShowActionModal(null);
    setShareEmail('');
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

  if (!claim) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Claim not found
          </h3>
        </div>
      </DashboardLayout>
    );
  }

  // Fix 15: backend tells us which actions are valid for this claim's current state.
  // Fall back to all actions if availableActions is absent (e.g. list-endpoint claims).
  const availableActions = claim.availableActions ?? [
    'approve',
    'reject',
    'create_investigation',
    'assign',
  ];

  const investigators = [
    'Jane Smith',
    'John Omondi',
    'Maria Garcia',
    'Ahmed Hassan',
    'Sarah Wilson',
  ];

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <Link
            href='/claims'
            className='text-blue-600 hover:text-blue-700 font-medium flex items-center'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to Claims
          </Link>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {claim.claimNumber}
            </h1>
            <p className='text-gray-600 mt-1'>{claim.providerName}</p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleDownloadClaim}>
              <Download className='h-4 w-4 mr-1' />
              Download
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowActionModal('share')}
            >
              <Share2 className='h-4 w-4 mr-1' />
              Share
            </Button>
          </div>
        </div>
        {/* Status Bar */}
        <Card className='p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Status</p>
              <StatusBadge status={claim.status} type='claim' />
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Risk Score</p>
              <RiskScoreBadge score={claim.riskScore} level={claim.riskLevel} />
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Claim Amount</p>
              <p className='text-xl font-bold text-gray-900'>
                {formatCurrency(claim.amount)}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-600 mb-1'>Service Date</p>
              <p className='text-lg font-semibold text-gray-900'>
                {formatDate(claim.serviceDateStart)}
              </p>
            </div>
          </div>
        </Card>
        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Claim Information */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Claim Information
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Patient ID (Masked)</p>
                  <p className='font-mono text-gray-900'>
                    {maskPatientId(claim.patientId)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Provider ID</p>
                  <p className='font-mono text-gray-900'>{claim.providerId}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Diagnosis</p>
                  <p className='text-gray-900'>{claim.diagnosis}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Procedure</p>
                  <p className='text-gray-900'>{claim.procedure}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Service Date Range</p>
                  <p className='text-gray-900'>
                    {formatDate(claim.serviceDateStart)} –{' '}
                    {formatDate(claim.serviceDateEnd)}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>County</p>
                  <p className='text-gray-900'>{claim.countyName}</p>
                </div>
              </div>
            </Card>
            {/* Fraud Flags */}
            {claim.fraudFlags.length > 0 && (
              <Card className='p-6 border-red-200 bg-red-50'>
                <h3 className='text-lg font-semibold text-red-900 mb-4 flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5' />
                  Fraud Flags ({claim.fraudFlags.length})
                </h3>
                <div className='space-y-3'>
                  {claim.fraudFlags.map(flag => (
                    <div
                      key={flag.id}
                      className='border border-red-200 rounded-lg p-3 bg-white'
                    >
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <p className='font-semibold text-gray-900'>
                            {flag.type}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {flag.description}
                          </p>
                        </div>
                        <Badge
                          variant={
                            flag.severity === 'critical'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {flag.severity}
                        </Badge>
                      </div>
                      {flag.evidence && (
                        <p className='text-xs text-gray-600 mt-2'>
                          {flag.evidence}
                        </p>
                      )}
                      <p className='text-xs text-gray-500 mt-2'>
                        {formatDateTime(flag.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {/* Fraud Analysis */}
            {analysis && (
              <Card className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Fraud Analysis
                </h3>
                {/* Top flags banner */}
                {analysis.topFlags.length > 0 && (
                  <div className='mb-4 flex flex-wrap gap-2'>
                    {analysis.topFlags.map(flag => (
                      <Badge
                        key={flag}
                        variant='destructive'
                        className='text-xs'
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Phantom Patient */}
                {/* Fix 12: was analysis.phantomPatient.iprsFlag — field is .detected */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
                    {analysis.phantomPatient.detected ? (
                      <AlertCircle className='h-5 w-5 text-red-600' />
                    ) : (
                      <CheckCircle2 className='h-5 w-5 text-green-600' />
                    )}
                    Phantom Patient Analysis
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>IPRS Status:</span>{' '}
                      {analysis.phantomPatient.iprsStatus}
                    </p>
                    <p>
                      <span className='font-medium'>Geographic Anomaly:</span>{' '}
                      {analysis.phantomPatient.geographicAnomaly ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className='font-medium'>
                        Visit Frequency Anomaly:
                      </span>{' '}
                      {analysis.phantomPatient.visitFrequencyAnomaly
                        ? 'Yes'
                        : 'No'}
                    </p>
                    <p>
                      <span className='font-medium'>Confidence:</span>{' '}
                      {analysis.phantomPatient.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {/* Upcoding */}
                {/* Fix 13: removed mlDetectionScore — not in backend schema */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
                    {analysis.upcoding.detected ? (
                      <AlertCircle className='h-5 w-5 text-red-600' />
                    ) : (
                      <CheckCircle2 className='h-5 w-5 text-green-600' />
                    )}
                    Upcoding Analysis
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>Detected:</span>{' '}
                      {analysis.upcoding.detected ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className='font-medium'>Confidence:</span>{' '}
                      {analysis.upcoding.confidence.toFixed(1)}%
                    </p>
                    {analysis.upcoding.flaggedServiceCodes.length > 0 && (
                      <p>
                        <span className='font-medium'>Flagged Codes:</span>{' '}
                        {analysis.upcoding.flaggedServiceCodes.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {/* Duplicate Detection */}
                {/* Fix 14: was duplicateDetection.exactMatches/fuzzyMatches — now duplicateClaim.duplicateCount */}
                <div className='mb-6'>
                  <h4 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
                    {analysis.duplicateClaim.detected ? (
                      <AlertCircle className='h-5 w-5 text-red-600' />
                    ) : (
                      <CheckCircle2 className='h-5 w-5 text-green-600' />
                    )}
                    Duplicate Claim Detection
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>Duplicate Count:</span>{' '}
                      {analysis.duplicateClaim.duplicateCount}
                    </p>
                    <p>
                      <span className='font-medium'>Same Provider:</span>{' '}
                      {analysis.duplicateClaim.sameProvider ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <span className='font-medium'>Detection Window:</span>{' '}
                      {analysis.duplicateClaim.windowDays} days
                    </p>
                    {analysis.duplicateClaim.duplicateClaimIds.length > 0 && (
                      <p>
                        <span className='font-medium'>Related Claims:</span>{' '}
                        {analysis.duplicateClaim.duplicateClaimIds.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {/* Provider Anomaly */}
                <div>
                  <h4 className='font-medium text-gray-900 mb-3 flex items-center gap-2'>
                    {analysis.providerAnomaly.detected ? (
                      <AlertCircle className='h-5 w-5 text-red-600' />
                    ) : (
                      <CheckCircle2 className='h-5 w-5 text-green-600' />
                    )}
                    Provider Anomaly
                  </h4>
                  <div className='bg-gray-50 p-4 rounded-lg space-y-2 text-sm'>
                    <p>
                      <span className='font-medium'>High Risk Flag:</span>{' '}
                      {analysis.providerAnomaly.highRiskFlag ? 'Yes' : 'No'}
                    </p>
                    {analysis.providerAnomaly.providerVsPeerRatio != null && (
                      <p>
                        <span className='font-medium'>vs Peer Average:</span>{' '}
                        {analysis.providerAnomaly.providerVsPeerRatio.toFixed(
                          2,
                        )}
                        ×
                      </p>
                    )}
                    <p>
                      <span className='font-medium'>Confidence:</span>{' '}
                      {analysis.providerAnomaly.confidence.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
          {/* Right Column — Actions */}
          <div className='space-y-6'>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Actions
              </h3>
              <div className='space-y-2'>
                {/* Fix 15: render only backend-permitted actions */}
                {availableActions.includes('approve') && (
                  <Button
                    onClick={() => setShowActionModal('approve')}
                    className='w-full bg-green-600 hover:bg-green-700'
                    disabled={approveClaim.isPending}
                  >
                    <CheckCircle2 className='h-4 w-4 mr-2' />
                    Approve
                  </Button>
                )}
                {availableActions.includes('reject') && (
                  <Button
                    onClick={() => setShowActionModal('reject')}
                    className='w-full bg-red-600 hover:bg-red-700'
                    disabled={rejectClaim.isPending}
                  >
                    <AlertCircle className='h-4 w-4 mr-2' />
                    Reject
                  </Button>
                )}
                {availableActions.includes('create_investigation') && (
                  <Button
                    onClick={() => setShowActionModal('investigate')}
                    className='w-full'
                    variant='outline'
                    disabled={flagForInvestigation.isPending}
                  >
                    Create Investigation
                  </Button>
                )}
                {availableActions.includes('assign') && (
                  <Button
                    onClick={() => setShowActionModal('assign')}
                    className='w-full'
                    variant='outline'
                    disabled={assignToInvestigator.isPending}
                  >
                    Assign to Investigator
                  </Button>
                )}
              </div>
            </Card>
            {/* Approve */}
            {showActionModal === 'approve' && (
              <Card className='p-6 border-green-200 bg-green-50'>
                <h4 className='font-semibold text-green-900 mb-3'>
                  Approve Claim
                </h4>
                <Textarea
                  placeholder='Add approval notes (optional)...'
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  className='mb-3'
                  rows={3}
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={handleApproveClaim}
                    disabled={approveClaim.isPending}
                    className='flex-1 bg-green-600 hover:bg-green-700'
                  >
                    {approveClaim.isPending
                      ? 'Approving...'
                      : 'Confirm Approval'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setActionNotes('');
                    }}
                    variant='outline'
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Reject */}
            {showActionModal === 'reject' && (
              <Card className='p-6 border-red-200 bg-red-50'>
                <h4 className='font-semibold text-red-900 mb-3'>
                  Reject Claim
                </h4>
                <Textarea
                  placeholder='Provide rejection reason...'
                  value={actionNotes}
                  onChange={e => setActionNotes(e.target.value)}
                  className='mb-3'
                  rows={3}
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={handleRejectClaim}
                    disabled={rejectClaim.isPending || !actionNotes}
                    className='flex-1 bg-red-600 hover:bg-red-700'
                  >
                    {rejectClaim.isPending
                      ? 'Rejecting...'
                      : 'Confirm Rejection'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setActionNotes('');
                    }}
                    variant='outline'
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Investigate */}
            {showActionModal === 'investigate' && (
              <Card className='p-6 border-blue-200 bg-blue-50'>
                <h4 className='font-semibold text-blue-900 mb-3'>
                  Create Investigation
                </h4>
                <Select
                  value={investigationType}
                  onValueChange={setInvestigationType}
                >
                  <SelectTrigger className='mb-3'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='suspected_fraud'>
                      Suspected Fraud
                    </SelectItem>
                    <SelectItem value='phantom_patient'>
                      Phantom Patient
                    </SelectItem>
                    <SelectItem value='upcoding'>Upcoding</SelectItem>
                    <SelectItem value='duplicate'>Duplicate Claim</SelectItem>
                  </SelectContent>
                </Select>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleFlagForInvestigation}
                    disabled={flagForInvestigation.isPending}
                    className='flex-1 bg-blue-600 hover:bg-blue-700'
                  >
                    {flagForInvestigation.isPending
                      ? 'Creating...'
                      : 'Create Investigation'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setInvestigationType('suspected_fraud');
                    }}
                    variant='outline'
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Assign */}
            {showActionModal === 'assign' && (
              <Card className='p-6 border-purple-200 bg-purple-50'>
                <h4 className='font-semibold text-purple-900 mb-3'>
                  Assign Investigator
                </h4>
                <Select
                  value={selectedInvestigator}
                  onValueChange={setSelectedInvestigator}
                >
                  <SelectTrigger className='mb-3'>
                    <SelectValue placeholder='Select investigator' />
                  </SelectTrigger>
                  <SelectContent>
                    {investigators.map(inv => (
                      <SelectItem key={inv} value={inv}>
                        {inv}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className='flex gap-2'>
                  <Button
                    onClick={handleAssignInvestigator}
                    disabled={
                      assignToInvestigator.isPending || !selectedInvestigator
                    }
                    className='flex-1 bg-purple-600 hover:bg-purple-700'
                  >
                    {assignToInvestigator.isPending ? 'Assigning...' : 'Assign'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setSelectedInvestigator('');
                    }}
                    variant='outline'
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Share */}
            {showActionModal === 'share' && (
              <Card className='p-6 border-blue-200 bg-blue-50'>
                <h4 className='font-semibold text-blue-900 mb-3'>
                  Share Claim
                </h4>
                <p className='text-sm text-blue-800 mb-3'>
                  Enter an email address to share this claim with a team member.
                </p>
                <input
                  type='email'
                  placeholder='Enter email address'
                  value={shareEmail}
                  onChange={e => setShareEmail(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md mb-3'
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={handleShareClaim}
                    disabled={!shareEmail.trim()}
                    className='flex-1 bg-blue-600 hover:bg-blue-700'
                  >
                    Share
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setShareEmail('');
                    }}
                    variant='outline'
                    className='flex-1'
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Metadata */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Details
              </h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-gray-600'>Submitted</p>
                  <p className='font-medium text-gray-900'>
                    {formatDateTime(claim.submittedAt)}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>Created</p>
                  <p className='font-medium text-gray-900'>
                    {formatDateTime(claim.createdAt)}
                  </p>
                </div>
                <div>
                  <p className='text-gray-600'>Last Updated</p>
                  <p className='font-medium text-gray-900'>
                    {formatDateTime(claim.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
