"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAlertById, useUpdateAlertStatus, useAssignAlert } from "@/hooks/queries/useAlerts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { formatCurrency, formatDate } from "@/lib/helpers";
import { AlertCircle, ArrowLeft, FileText, Download, Share2, Eye } from "lucide-react";
import Link from "next/link";

export default function AlertDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedInvestigator, setSelectedInvestigator] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: alert, isLoading } = useAlertById(alertId);
  const updateAlertStatus = useUpdateAlertStatus();
  const assignAlert = useAssignAlert();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner text="Loading alert details..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!alert) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Alert not found</h3>
          <p className="text-gray-600 mt-2">The alert you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateAlertStatus.mutateAsync({
        alertId,
        status: newStatus as any,
      });
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error("[v0] Error updating alert status:", error);
    }
  };

  const handleAssignAlert = async () => {
    if (!selectedInvestigator) return;
    try {
      await assignAlert.mutateAsync({
        alertId,
        investigatorId: selectedInvestigator,
        investigatorName: selectedInvestigator,
      });
      setShowAssignModal(false);
    } catch (error) {
      console.error("[v0] Error assigning alert:", error);
    }
  };

  const investigators = ["Jane Smith", "John Omondi", "Maria Garcia", "Ahmed Hassan", "Sarah Wilson"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{alert.alertNumber}</h1>
              <p className="text-gray-600 mt-1">{alert.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Alert Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{alert.type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <RiskScoreBadge score={alert.riskScore} level={alert.severity} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <StatusBadge status={alert.status} size="sm" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{formatDate(alert.createdAt)}</p>
                </div>
              </div>
            </Card>

            {/* Related Claim */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Claim</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Claim Number</span>
                  <Link href={`/claims/${alert.claimId}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {alert.claimNumber}
                  </Link>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Provider</span>
                  <Link href={`/providers/${alert.providerId}`} className="font-medium text-blue-600 hover:text-blue-700">
                    {alert.providerName}
                  </Link>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">{alert.description}</p>
            </Card>

            {/* Fraud Analysis */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fraud Analysis</h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-600 mb-1">Estimated Fraud Amount</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(alert.estimatedFraudAmount)}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                  <p className="text-2xl font-bold text-yellow-600">{alert.riskScore}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <Select value={selectedStatus || alert.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setShowAssignModal(!showAssignModal)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Assign to Investigator
                </Button>

                {showAssignModal && (
                  <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <Select value={selectedInvestigator} onValueChange={setSelectedInvestigator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select investigator" />
                      </SelectTrigger>
                      <SelectContent>
                        {investigators.map((inv) => (
                          <SelectItem key={inv} value={inv}>
                            {inv}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAssignAlert}
                        disabled={!selectedInvestigator}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAssignModal(false);
                          setSelectedInvestigator("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Assignment Info */}
            {alert.assignedTo && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Assigned To</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-700">
                      {alert.assignedToName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.assignedToName}</p>
                    <p className="text-sm text-gray-600">Investigator</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Alert Created</p>
                    <p className="text-gray-600">{formatDate(alert.createdAt)}</p>
                  </div>
                </div>
                {alert.resolvedAt && (
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Alert Resolved</p>
                      <p className="text-gray-600">{formatDate(alert.resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
