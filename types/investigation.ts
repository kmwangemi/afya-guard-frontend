export type InvestigationStatus =
  | "open"
  | "in_progress"
  | "pending_review"
  | "completed"
  | "closed";

export type InvestigationPriority = "low" | "medium" | "high" | "critical";

export type InvestigationOutcome = "fraud_confirmed" | "suspected" | "inconclusive" | "no_fraud";

export interface InvestigationTimeline {
  date: Date;
  action: string;
  investigator: string;
  notes?: string;
}

export interface InvestigationEvidence {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

export interface InvestigationOutcomeDetails {
  outcome: InvestigationOutcome;
  fraudConfirmed: boolean;
  confirmedAmount?: number;
  recommendations: string[];
  actionsTaken: string[];
  notes: string;
}

export interface Investigation {
  id: string;
  caseNumber: string;
  claimId: string;
  claimNumber?: string;
  alertId?: string;
  alertNumber?: string;
  providerId: string;
  providerName: string;
  investigatorId: string;
  investigatorName: string;
  priority: InvestigationPriority;
  status: InvestigationStatus;
  createdAt: Date;
  startedAt?: Date;
  targetDate?: Date;
  completedAt?: Date;
  daysOpen: number;
  progress: number; // 0-100
  findings?: string;
  timeline: InvestigationTimeline[];
  evidence: InvestigationEvidence[];
  outcome?: InvestigationOutcomeDetails;
  notes?: string;
}

export interface InvestigationFilterParams {
  status?: InvestigationStatus;
  priority?: InvestigationPriority;
  investigatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  outcome?: InvestigationOutcome;
  providerId?: string;
}

export interface CreateInvestigationPayload {
  claimId?: string;
  alertId?: string;
  investigatorId: string;
  priority: InvestigationPriority;
  targetDate?: Date;
  notes?: string;
}
