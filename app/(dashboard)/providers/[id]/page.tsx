'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
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
import { Textarea } from '@/components/ui/textarea';
import {
  useFlagProviderForReview,
  useProviderById,
  useSuspendProvider,
} from '@/hooks/queries/useProviders';
import { formatCurrency, formatDate, formatProviderPercentage } from '@/lib/helpers';
import {
  AlertCircle,
  ChevronLeft,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProviderDetailPage() {
  const params = useParams();
  const providerId = params.id as string;
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  // Fix 12: useProviderById replaces useEffect + mockProvidersService.getProviderById
  const { data: provider, isLoading } = useProviderById(providerId);
  // Fix 20: mutation hooks replace direct service calls
  const suspendProvider = useSuspendProvider();
  const flagForReview = useFlagProviderForReview();
  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspending the provider.');
      return;
    }
    try {
      await suspendProvider.mutateAsync({ providerId, reason: suspendReason });
      setSuspendDialogOpen(false);
      setSuspendReason('');
      toast.success('Provider has been suspended.');
    } catch (err) {
      console.error('[providers] suspend error:', err);
      toast.error('Failed to suspend provider.');
    }
  };
  const handleFlag = async () => {
    if (!flagReason.trim()) {
      toast('Please provide a reason for flagging the provider.');
      return;
    }
    try {
      await flagForReview.mutateAsync({ providerId, reason: flagReason });
      setFlagDialogOpen(false);
      setFlagReason('');
      toast.success('Provider has been flagged for review.');
    } catch (err) {
      console.error('[providers] flag error:', err);
      toast.error('Failed to flag provider.');
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
  if (!provider) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <AlertCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900'>
            Provider not found
          </h3>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link href='/providers'>
              <Button variant='ghost' size='sm'>
                <ChevronLeft className='h-4 w-4 mr-1' />
                Back
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                {provider.name}
              </h1>
              <p className='text-gray-600 mt-1'>{provider.shaProviderCode}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => setSuspendDialogOpen(true)}
            >
              Suspend
            </Button>
            <Button
              className='bg-blue-600 hover:bg-blue-700'
              onClick={() => setFlagDialogOpen(true)}
            >
              Flag for Review
            </Button>
          </div>
        </div>
        {/* Key Stats — Fix 13/14: header.confirmedFraudCount, header.flaggedClaimsPercentage */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Risk Score</p>
            <RiskScoreBadge
              score={provider.header.riskScore ?? 0}
              level={provider.header.riskLevel ?? 'LOW'}
            />
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Total Claims</p>
            <p className='text-2xl font-bold text-gray-900'>
              {provider.header.totalClaims.toLocaleString()}
            </p>
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Flagged Claims %</p>
            {/* Fix 14: was provider.statistics.flaggedPercentage */}
            <p className='text-2xl font-bold text-red-600'>
              {formatProviderPercentage(provider.header.flaggedClaimsPercentage)}
            </p>
          </Card>
          <Card className='p-6'>
            <p className='text-sm text-gray-600 mb-2'>Confirmed Fraud</p>
            {/* Fix 13: was provider.statistics.confirmedFraud */}
            <p className='text-2xl font-bold text-orange-600'>
              {provider.header.confirmedFraudCount}
            </p>
          </Card>
        </div>
        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Provider Information */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Provider Information
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-600'>Facility Type</p>
                  <p className='font-semibold text-gray-900 capitalize'>
                    {provider.providerInformation.facilityType
                      ?.replace(/_/g, ' ')
                      .toLowerCase() ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>County</p>
                  <p className='font-semibold text-gray-900'>
                    {provider.providerInformation.county ?? 'N/A'}
                  </p>
                </div>
                {/* <div>
                  <p className='text-sm text-gray-600'>Contact</p>
                  <p className='font-semibold text-gray-900'>
                    {provider.providerInformation.phone ?? 'N/A'}
                  </p>
                </div> */}
                {/* <div>
                  <p className='text-sm text-gray-600'>Email</p>
                  <p className='font-semibold text-gray-900'>
                    {provider.providerInformation.email ?? 'N/A'}
                  </p>
                </div> */}
                <div>
                  <p className='text-sm text-gray-600'>Bed Capacity</p>
                  <p className='font-semibold text-gray-900'>
                    {provider.providerInformation.bedCapacity ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>Status</p>
                  <p
                    className={`font-semibold ${
                      provider.providerInformation.status === 'ACTIVE'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {provider.providerInformation.status ?? 'Unknown'}
                  </p>
                </div>
              </div>
            </Card>
            {/* Risk Profile — Fix 15/16/17: backend uses nested RiskProfileBar objects */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Risk Profile
              </h3>
              <div className='space-y-4'>
                {[
                  provider.riskProfile.claimDeviation,
                  provider.riskProfile.rejectionRate,
                  provider.riskProfile.fraudHistoryScore,
                ].map(bar => (
                  <div key={bar.label}>
                    <div className='flex justify-between mb-2'>
                      <span className='text-sm font-medium text-gray-700'>
                        {bar.label}
                      </span>
                      <span className='text-sm font-semibold text-gray-900'>
                        {bar.value.toFixed(1)}%
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          bar.colour === 'red'
                            ? 'bg-red-600'
                            : bar.colour === 'orange'
                              ? 'bg-orange-600'
                              : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(bar.value, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {/* Statistics */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Statistics
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-xs text-gray-600 mb-1'>Total Amount</p>
                  <p className='text-xl font-bold text-gray-900'>
                    {formatCurrency(provider.statistics.totalAmount)}
                  </p>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-xs text-gray-600 mb-1'>Average Claim</p>
                  <p className='text-xl font-bold text-gray-900'>
                    {formatCurrency(provider.statistics.averageClaim)}
                  </p>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-xs text-gray-600 mb-1'>Rejection Rate</p>
                  <p className='text-xl font-bold text-gray-900'>
                    {formatProviderPercentage(provider.statistics.rejectionRate)}
                  </p>
                </div>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <p className='text-xs text-gray-600 mb-1'>
                    Avg Processing Time
                  </p>
                  <p className='text-xl font-bold text-gray-900'>
                    {provider.statistics.avgProcessingTimeDays.toFixed(1)} days
                  </p>
                </div>
              </div>
            </Card>
          </div>
          {/* Right Column */}
          <div className='space-y-6'>
            {/* Quick Stats */}
            <Card className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Stats
              </h3>
              <div className='space-y-4'>
                <div className='flex items-center justify-between pb-4 border-b'>
                  <div className='flex items-center gap-3'>
                    <FileText className='h-5 w-5 text-blue-600' />
                    <span className='text-sm text-gray-700'>Total Claims</span>
                  </div>
                  <span className='font-semibold text-gray-900'>
                    {provider.quickStats.totalClaims.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center justify-between pb-4 border-b'>
                  <div className='flex items-center gap-3'>
                    <AlertCircle className='h-5 w-5 text-red-600' />
                    <span className='text-sm text-gray-700'>Flagged</span>
                  </div>
                  <span className='font-semibold text-gray-900'>
                    {provider.quickStats.flagged.toLocaleString()}
                  </span>
                </div>
                <div className='flex items-center justify-between pb-4 border-b'>
                  <div className='flex items-center gap-3'>
                    <TrendingUp className='h-5 w-5 text-orange-600' />
                    <span className='text-sm text-gray-700'>
                      Confirmed Fraud
                    </span>
                  </div>
                  <span className='font-semibold text-gray-900'>
                    {provider.quickStats.confirmedFraud}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Users className='h-5 w-5 text-green-600' />
                    <span className='text-sm text-gray-700'>Last Claim</span>
                  </div>
                  {/* Fix 19: was provider.lastClaimDate */}
                  <span className='font-semibold text-gray-900'>
                    {provider.quickStats.lastClaimDate
                      ? formatDate(new Date(provider.quickStats.lastClaimDate))
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
            {/* Fraud History — Fix 18: was provider.fraudHistory.confirmedCases */}
            <Card className='p-6 border-red-200 bg-red-50'>
              <h3 className='text-lg font-semibold text-red-900 mb-4'>
                Fraud History
              </h3>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-red-700'>Confirmed Cases</p>
                  <p className='text-2xl font-bold text-red-600'>
                    {provider.fraudHistory.confirmedCases}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-red-700'>Suspected Cases</p>
                  <p className='text-2xl font-bold text-orange-600'>
                    {provider.fraudHistory.suspectedCases}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-red-700'>Total Amount</p>
                  <p className='text-xl font-bold text-red-600'>
                    {formatCurrency(provider.fraudHistory.totalFraudAmount)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Provider</DialogTitle>
              <DialogDescription>
                Provide a reason for suspending {provider.name}. This will
                prevent the provider from submitting new claims.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder='Enter reason for suspension...'
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              className='min-h-[100px]'
            />
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setSuspendDialogOpen(false);
                  setSuspendReason('');
                }}
                disabled={suspendProvider.isPending}
              >
                Cancel
              </Button>
              <Button
                variant='destructive'
                onClick={handleSuspend}
                disabled={suspendProvider.isPending}
              >
                {suspendProvider.isPending ? 'Suspending...' : 'Suspend'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Flag Dialog */}
        <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Provider for Review</DialogTitle>
              <DialogDescription>
                Provide details about why {provider.name} should be flagged for
                review.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder='Enter reason for flagging...'
              value={flagReason}
              onChange={e => setFlagReason(e.target.value)}
              className='min-h-[100px]'
            />
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setFlagDialogOpen(false);
                  setFlagReason('');
                }}
                disabled={flagForReview.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleFlag} disabled={flagForReview.isPending}>
                {flagForReview.isPending ? 'Flagging...' : 'Flag for Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
