"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/helpers";
import { mockInvestigationsService } from "@/services/mockInvestigationsService";
import { ChevronLeft, Upload, Check, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function InvestigationDetailPage() {
  const params = useParams();
  const investigationId = params.id as string;
  const { toast } = useToast();

  const [investigation, setInvestigation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [updateProgressDialogOpen, setUpdateProgressDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [newProgress, setNewProgress] = useState(0);
  const [closeOutcome, setCloseOutcome] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await mockInvestigationsService.getInvestigationById(investigationId);
        setInvestigation(data);
        if (data?.progress) {
          setNewProgress(data.progress);
        }
      } catch (error) {
        console.error("[v0] Error loading investigation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [investigationId]);

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await mockInvestigationsService.updateInvestigationStatus(
        investigationId,
        newStatus as any
      );
      if (updated) {
        setInvestigation(updated);
        setUpdateStatusDialogOpen(false);
        toast({
          title: "Success",
          description: "Investigation status updated",
        });
      }
    } catch (error) {
      console.error("[v0] Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async () => {
    setIsSubmitting(true);
    try {
      const updated = await mockInvestigationsService.updateInvestigationProgress(
        investigationId,
        newProgress,
        progressNotes
      );
      if (updated) {
        setInvestigation(updated);
        setUpdateProgressDialogOpen(false);
        setProgressNotes("");
        toast({
          title: "Success",
          description: "Investigation progress updated",
        });
      }
    } catch (error) {
      console.error("[v0] Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseInvestigation = async () => {
    if (!closeOutcome) {
      toast({
        title: "Error",
        description: "Please select an outcome",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await mockInvestigationsService.closeInvestigation(
        investigationId,
        {
          outcome: closeOutcome as any,
          fraudConfirmed: Math.random() > 0.5,
          confirmedAmount: Math.random() * 100000,
          recommendations: ["Recover funds", "Review provider contract"],
          actionsTaken: ["Claim denied", "Provider flagged"],
          notes: closeNotes,
        },
        closeNotes
      );
      if (updated) {
        setInvestigation(updated);
        setCloseDialogOpen(false);
        setCloseOutcome("");
        setCloseNotes("");
        toast({
          title: "Success",
          description: "Investigation closed",
        });
      }
    } catch (error) {
      console.error("[v0] Error closing investigation:", error);
      toast({
        title: "Error",
        description: "Failed to close investigation",
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

  if (!investigation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Investigation not found</h3>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    pending_review: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/investigations">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{investigation.caseNumber}</h1>
              <p className="text-gray-600 mt-1">{investigation.providerName}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setUpdateStatusDialogOpen(true)}
            >
              Update Status
            </Button>
            <Button 
              variant="outline"
              onClick={() => setUpdateProgressDialogOpen(true)}
            >
              Update Progress
            </Button>
            {investigation.status !== "completed" && investigation.status !== "closed" && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setCloseDialogOpen(true)}
              >
                Close Investigation
              </Button>
            )}
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${statusColors[investigation.status]}`}>
              {investigation.status.charAt(0).toUpperCase() + investigation.status.slice(1).replace("_", " ")}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Priority</p>
            <div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${priorityColors[investigation.priority]}`}>
              {investigation.priority.charAt(0).toUpperCase() + investigation.priority.slice(1)}
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Days Open</p>
            <p className="text-2xl font-bold text-gray-900">{investigation.daysOpen}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-2">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${investigation.progress}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-gray-900">{investigation.progress}%</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Investigation Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investigation Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Investigator</p>
                  <p className="font-semibold text-gray-900">{investigation.investigatorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Related Claim</p>
                  <p className="font-semibold text-gray-900">{investigation.claimNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold text-gray-900">{formatDate(investigation.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(investigation.targetDate)}</p>
                </div>
                {investigation.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="font-semibold text-gray-900">{formatDate(investigation.completedAt)}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Findings */}
            {investigation.findings && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Findings</h3>
                <p className="text-gray-700">{investigation.findings}</p>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                {investigation.timeline?.map((entry: any, idx: number) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-2" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{entry.action}</p>
                      <p className="text-sm text-gray-600">{entry.investigator}</p>
                      <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Evidence */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h3>
              {investigation.evidence && investigation.evidence.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">File Name</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Uploaded By</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investigation.evidence.map((evidence: any) => (
                      <TableRow key={evidence.id}>
                        <TableCell className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <a href={evidence.fileUrl} className="text-blue-600 hover:text-blue-700">
                            {evidence.fileName}
                          </a>
                        </TableCell>
                        <TableCell>{evidence.fileType.toUpperCase()}</TableCell>
                        <TableCell>{evidence.uploadedBy}</TableCell>
                        <TableCell>{formatDate(evidence.uploadedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No evidence uploaded yet</p>
              )}
              <Button className="mt-4" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload Evidence
              </Button>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Investigation Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Alert Number</p>
                  <p className="text-sm font-semibold text-gray-900">{investigation.alertNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Claim Number</p>
                  <p className="text-sm font-semibold text-gray-900">{investigation.claimNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Provider</p>
                  <p className="text-sm font-semibold text-gray-900">{investigation.providerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Investigator</p>
                  <p className="text-sm font-semibold text-gray-900">{investigation.investigatorName}</p>
                </div>
              </div>
            </Card>

            {/* Outcome (if completed) */}
            {investigation.outcome && (
              <Card className="p-6 border-green-200 bg-green-50">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Investigation Outcome</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-green-700">Outcome</p>
                    <p className="font-semibold text-green-900">
                      {investigation.outcome.outcome.replace("_", " ")}
                    </p>
                  </div>
                  {investigation.outcome.fraudConfirmed && (
                    <>
                      <div>
                        <p className="text-sm text-red-700">Fraud Confirmed</p>
                        <p className="text-lg font-bold text-red-600">Yes</p>
                      </div>
                      <div>
                        <p className="text-sm text-red-700">Amount</p>
                        <p className="font-semibold text-red-900">
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(investigation.outcome.confirmedAmount)}
                        </p>
                      </div>
                    </>
                  )}
                  {investigation.outcome.recommendations?.length > 0 && (
                    <div>
                      <p className="text-sm text-green-700 mb-2">Recommendations</p>
                      <ul className="space-y-1">
                        {investigation.outcome.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-sm text-green-900 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Investigation Status</DialogTitle>
              <DialogDescription>
                Change the status of this investigation
              </DialogDescription>
            </DialogHeader>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={updateProgressDialogOpen} onOpenChange={setUpdateProgressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Investigation Progress</DialogTitle>
              <DialogDescription>
                Update the progress and add notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Progress (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  placeholder="Add progress notes..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateProgressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProgress} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Investigation</DialogTitle>
              <DialogDescription>
                Finalize the investigation with an outcome
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Outcome</label>
                <Select value={closeOutcome} onValueChange={setCloseOutcome}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fraud_confirmed">Fraud Confirmed</SelectItem>
                    <SelectItem value="suspected">Suspected</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive</SelectItem>
                    <SelectItem value="no_fraud">No Fraud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Notes</label>
                <Textarea
                  placeholder="Add final notes..."
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCloseInvestigation} disabled={isSubmitting}>
                {isSubmitting ? "Closing..." : "Close Investigation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
