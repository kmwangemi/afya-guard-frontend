"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Claim, ClaimAnalysis } from "@/types/claim";
import { mockClaimsService } from "@/services/mockClaimsService";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime, formatCurrency, maskPatientId } from "@/lib/helpers";
import { ChevronLeft, AlertCircle, CheckCircle2, Download, Share2 } from "lucide-react";
import Link from "next/link";

export default function ClaimDetailPage() {
  const params = useParams();
  const claimId = params.id as string;

  const [claim, setClaim] = useState<Claim | null>(null);
  const [analysis, setAnalysis] = useState<ClaimAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [claimData, analysisData] = await Promise.all([
          mockClaimsService.getClaimById(claimId),
          mockClaimsService.getClaimAnalysis(claimId),
        ]);
        setClaim(claimData);
        setAnalysis(analysisData);
      } catch (error) {
        console.error("[v0] Error loading claim:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [claimId]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/claims">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{claim.claimNumber}</h1>
              <p className="text-gray-600 mt-1">{claim.providerName}</p>
            </div>
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
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button className="w-full variant-outline">
                  Create Investigation
                </Button>
                <Button className="w-full variant-outline">
                  Assign to Investigator
                </Button>
              </div>
            </Card>

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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
