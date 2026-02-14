"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Provider } from "@/types/provider";
import { mockProvidersService } from "@/services/mockProvidersService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { formatCurrency, formatDate, formatPercentage } from "@/lib/helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, AlertCircle, TrendingUp, Users, FileText } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function ProviderDetailPage() {
  const params = useParams();
  const providerId = params.id as string;
  const { toast } = useToast();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await mockProvidersService.getProviderById(providerId);
        setProvider(data);
      } catch (error) {
        console.error("[v0] Error loading provider:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [providerId]);

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspending the provider",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProvider = await mockProvidersService.suspendProvider(providerId, suspendReason);
      if (updatedProvider) {
        setProvider(updatedProvider);
        setSuspendDialogOpen(false);
        setSuspendReason("");
        toast({
          title: "Success",
          description: "Provider has been suspended successfully",
        });
      }
    } catch (error) {
      console.error("[v0] Error suspending provider:", error);
      toast({
        title: "Error",
        description: "Failed to suspend provider",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for flagging the provider",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProvider = await mockProvidersService.flagForReview(providerId, flagReason);
      if (updatedProvider) {
        setProvider(updatedProvider);
        setFlagDialogOpen(false);
        setFlagReason("");
        toast({
          title: "Success",
          description: "Provider has been flagged for review",
        });
      }
    } catch (error) {
      console.error("[v0] Error flagging provider:", error);
      toast({
        title: "Error",
        description: "Failed to flag provider",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Provider not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/providers">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
              <p className="text-gray-600 mt-1">{provider.code}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSuspendDialogOpen(true)}
            >
              Suspend
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setFlagDialogOpen(true)}
            >
              Flag for Review
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Risk Score</p>
            <RiskScoreBadge score={provider.riskScore} level={provider.riskLevel} />
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Total Claims</p>
            <p className="text-2xl font-bold text-gray-900">
              {provider.statistics.totalClaims.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Flagged Claims %</p>
            <p className="text-2xl font-bold text-red-600">
              {formatPercentage(provider.statistics.flaggedPercentage)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Confirmed Fraud</p>
            <p className="text-2xl font-bold text-orange-600">
              {provider.statistics.confirmedFraud}
            </p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Facility Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{provider.facilityType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">County</p>
                  <p className="font-semibold text-gray-900">{provider.countyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold text-gray-900">{provider.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{provider.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bed Capacity</p>
                  <p className="font-semibold text-gray-900">{provider.bedCapacity || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold ${provider.active ? "text-green-600" : "text-red-600"}`}>
                    {provider.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Risk Profile */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Profile</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Claim Deviation</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(provider.riskProfile.claimDeviation)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${Math.min(provider.riskProfile.claimDeviation, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Rejection Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPercentage(provider.riskProfile.rejectionRate)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${Math.min(provider.riskProfile.rejectionRate * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Fraud History Score</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(provider.riskProfile.fraudHistory)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(provider.riskProfile.fraudHistory, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(provider.statistics.totalAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Average Claim</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(provider.statistics.averageAmount)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Rejection Rate</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPercentage(provider.statistics.rejectionRate)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Avg Processing Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {provider.statistics.averageProcessingTime} days
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Total Claims</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {provider.statistics.totalClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm text-gray-700">Flagged</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {provider.statistics.flaggedClaims}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <span className="text-sm text-gray-700">Confirmed Fraud</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {provider.statistics.confirmedFraud}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Last Claim</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatDate(provider.lastClaimDate)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Fraud History */}
            {provider.fraudHistory && (
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Fraud History</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-red-700">Confirmed Cases</p>
                    <p className="text-2xl font-bold text-red-600">
                      {provider.fraudHistory.confirmedCases}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Suspected Cases</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {provider.fraudHistory.suspectedCases}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-red-700">Total Amount</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(provider.fraudHistory.totalAmount)}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Suspend Dialog */}
        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Provider</DialogTitle>
              <DialogDescription>
                Please provide a reason for suspending {provider?.name}. This action will prevent the provider from submitting new claims.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSuspendDialogOpen(false);
                  setSuspendReason("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSuspend}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Suspending..." : "Suspend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Flag for Review Dialog */}
        <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Flag Provider for Review</DialogTitle>
              <DialogDescription>
                Please provide details about why {provider?.name} should be flagged for review. This will trigger an investigation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Enter reason for flagging..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFlagDialogOpen(false);
                  setFlagReason("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFlag}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Flagging..." : "Flag for Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
