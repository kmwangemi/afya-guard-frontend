"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClaimById, useClaimAnalysis, useApproveClaim, useRejectClaim, useFlagClaimForInvestigation, useAssignClaimToInvestigator } from "@/hooks/queries/useClaims";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime, formatCurrency, maskPatientId } from "@/lib/helpers";
import { ChevronLeft, AlertCircle, CheckCircle2, Download, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const [showActionModal, setShowActionModal] = useState<"approve" | "reject" | "investigate" | "assign" | "share" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [selectedInvestigator, setSelectedInvestigator] = useState("");
  const [investigationType, setInvestigationType] = useState("suspected_fraud");
  const [shareEmail, setShareEmail] = useState("");

  const { data: claim, isLoading: claimLoading } = useClaimById(claimId);
  const { data: analysis, isLoading: analysisLoading } = useClaimAnalysis(claimId);
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();
  const flagForInvestigation = useFlagClaimForInvestigation();
  const assignToInvestigator = useAssignClaimToInvestigator();

  const isLoading = claimLoading || analysisLoading;

  const handleApproveClaim = async () => {
    try {
      await approveClaim.mutateAsync({ claimId, notes: actionNotes });
      setShowActionModal(null);
      setActionNotes("");
    } catch (error) {
      console.error("[v0] Error approving claim:", error);
    }
  };

  const handleRejectClaim = async () => {
    try {
      await rejectClaim.mutateAsync({ claimId, reason: actionNotes });
      setShowActionModal(null);
      setActionNotes("");
    } catch (error) {
      console.error("[v0] Error rejecting claim:", error);
    }
  };

  const handleFlagForInvestigation = async () => {
    try {
      await flagForInvestigation.mutateAsync({ claimId, investigationType });
      setShowActionModal(null);
      setInvestigationType("suspected_fraud");
    } catch (error) {
      console.error("[v0] Error flagging claim:", error);
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
      setSelectedInvestigator("");
    } catch (error) {
      console.error("[v0] Error assigning claim:", error);
    }
  };

  const handleDownloadClaim = () => {
    if (!claim) return;
    const claimData = {
      id: claim.id,
      claimNumber: claim.claimNumber,
      status: claim.status,
      providerName: claim.providerName,
      patientId: maskPatientId(claim.patientId),
      amount: claim.amount,
      createdAt: claim.createdAt,
      lastUpdated: claim.updatedAt,
    };
    
    const dataStr = JSON.stringify(claimData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `claim-${claim.claimNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShareClaim = () => {
    if (!shareEmail.trim()) return;
    console.log("[v0] Sharing claim to:", shareEmail);
    setShareEmail("");
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

  if (!claim) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Claim not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  const investigators = ["Jane Smith", "John Omondi", "Maria Garcia", "Ahmed Hassan", "Sarah Wilson"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/claims"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Claims
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadClaim}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActionModal("share" as any)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{claim.claimNumber}</h1>
              <p className="text-gray-600 mt-1">{claim.providerName}</p>
            </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        {/* Status Bar */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <StatusBadge status={claim.status} type="claim" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Risk Score</p>
              <RiskScoreBadge score={claim.riskScore} level={claim.riskLevel} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Claim Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(claim.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Service Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(claim.serviceDateStart)}</p>
            </div>
          </div>
        </Card>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claim Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patient ID (Masked)</p>
                  <p className="font-mono text-gray-900">{maskPatientId(claim.patientId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider ID</p>
                  <p className="font-mono text-gray-900">{claim.providerId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Diagnosis</p>
                  <p className="text-gray-900">{claim.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procedure</p>
                  <p className="text-gray-900">{claim.procedure}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Date Range</p>
                  <p className="text-gray-900">
                    {formatDate(claim.serviceDateStart)} - {formatDate(claim.serviceDateEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">County</p>
                  <p className="text-gray-900">{claim.countyName}</p>
                </div>
              </div>
            </Card>
            {/* Fraud Flags */}
            {claim.fraudFlags.length > 0 && (
              <Card className="p-6 border-red-200 bg-red-50">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Fraud Flags ({claim.fraudFlags.length})
                </h3>
                <div className="space-y-3">
                  {claim.fraudFlags.map((flag) => (
                    <div key={flag.id} className="border border-red-200 rounded-lg p-3 bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{flag.type}</p>
                          <p className="text-sm text-gray-600">{flag.description}</p>
                        </div>
                        <Badge variant={flag.severity === "critical" ? "destructive" : "secondary"}>
                          {flag.severity}
                        </Badge>
                      </div>
                      {flag.evidence && (
                        <p className="text-xs text-gray-600 mt-2">{flag.evidence}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDateTime(flag.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {/* Fraud Analysis */}
            {analysis && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fraud Analysis</h3>
                {/* Phantom Patient Analysis */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    {analysis.phantomPatient.iprsFlag ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    Phantom Patient Analysis
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><span className="font-medium">IPRS Status:</span> {analysis.phantomPatient.iprsStatus}</p>
                    <p><span className="font-medium">Geographic Anomaly:</span> {analysis.phantomPatient.geographicAnomaly ? "Yes" : "No"}</p>
                    <p><span className="font-medium">Visit Frequency Anomaly:</span> {analysis.phantomPatient.visitFrequencyAnomaly ? "Yes" : "No"}</p>
                  </div>
                </div>
                {/* Upcoding Analysis */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    {analysis.upcoding.detected ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    Upcoding Analysis
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><span className="font-medium">Detected:</span> {analysis.upcoding.detected ? "Yes" : "No"}</p>
                    <p><span className="font-medium">Confidence:</span> {analysis.upcoding.confidence.toFixed(1)}%</p>
                    <p><span className="font-medium">ML Detection Score:</span> {analysis.upcoding.mlDetectionScore.toFixed(1)}</p>
                  </div>
                </div>
                {/* Duplicate Detection */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Duplicate Detection</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p><span className="font-medium">Exact Matches:</span> {analysis.duplicateDetection.exactMatches}</p>
                    <p><span className="font-medium">Fuzzy Matches:</span> {analysis.duplicateDetection.fuzzyMatches}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowActionModal("approve")}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={approveClaim.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  onClick={() => setShowActionModal("reject")}
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={rejectClaim.isPending}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => setShowActionModal("investigate")}
                  className="w-full"
                  variant="outline"
                  disabled={flagForInvestigation.isPending}
                >
                  Create Investigation
                </Button>
                <Button 
                  onClick={() => setShowActionModal("assign")}
                  className="w-full"
                  variant="outline"
                  disabled={assignToInvestigator.isPending}
                >
                  Assign to Investigator
                </Button>
              </div>
            </Card>
            {/* Action Modals */}
            {showActionModal === "approve" && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-3">Approve Claim</h4>
                <Textarea
                  placeholder="Add approval notes (optional)..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleApproveClaim}
                    disabled={approveClaim.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Confirm Approval
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setActionNotes("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {showActionModal === "reject" && (
              <Card className="p-6 border-red-200 bg-red-50">
                <h4 className="font-semibold text-red-900 mb-3">Reject Claim</h4>
                <Textarea
                  placeholder="Provide rejection reason..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleRejectClaim}
                    disabled={rejectClaim.isPending || !actionNotes}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setActionNotes("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {showActionModal === "investigate" && (
              <Card className="p-6 border-blue-200 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3">Create Investigation</h4>
                <Select value={investigationType} onValueChange={setInvestigationType}>
                  <SelectTrigger className="mb-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspected_fraud">Suspected Fraud</SelectItem>
                    <SelectItem value="phantom_patient">Phantom Patient</SelectItem>
                    <SelectItem value="upcoding">Upcoding</SelectItem>
                    <SelectItem value="duplicate">Duplicate Claim</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleFlagForInvestigation}
                    disabled={flagForInvestigation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Investigation
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setInvestigationType("suspected_fraud");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {showActionModal === "assign" && (
              <Card className="p-6 border-purple-200 bg-purple-50">
                <h4 className="font-semibold text-purple-900 mb-3">Assign Investigator</h4>
                <Select value={selectedInvestigator} onValueChange={setSelectedInvestigator}>
                  <SelectTrigger className="mb-3">
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
                    onClick={handleAssignInvestigator}
                    disabled={assignToInvestigator.isPending || !selectedInvestigator}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Assign
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setSelectedInvestigator("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
            {/* Metadata */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDateTime(claim.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{formatDateTime(claim.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDateTime(claim.updatedAt)}</p>
                </div>
              </div>
            </Card>
            {showActionModal === "share" && (
              <Card className="p-6 border-blue-200 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3">Share Claim</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Enter email address(es) to share this claim with other team members
                </p>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleShareClaim}
                    disabled={!shareEmail.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Share
                  </Button>
                  <Button
                    onClick={() => {
                      setShowActionModal(null);
                      setShareEmail("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
