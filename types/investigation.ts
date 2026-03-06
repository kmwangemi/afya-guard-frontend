// ─── Investigation domain types ───────────────────────────────────────────────
// Aligned to backend CaseStatus, CasePriority enums and
// InvestigationListItem / InvestigationDetailResponse schemas

// Fix 1: was "open"|"in_progress"|"pending_review"|"completed"|"closed"
// Backend CaseStatus is UPPERCASE and uses different values
export type CaseStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'CONFIRMED_FRAUD'
  | 'CLEARED'
  | 'CLOSED';

// Fix 2: was "low"|"medium"|"high"|"critical" — "critical" doesn't exist
// Backend CasePriority: LOW | MEDIUM | HIGH | URGENT
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// ── List item (GET /investigations) ──────────────────────────────────────────
export interface InvestigationListItem {
  id: string;
  invNumber: string; // "INV-00084"
  investigatorName: string | null;
  investigatorId: string | null;
  providerName: string | null;
  providerId: string | null;
  claimId: string;
  shaClaimId: string | null;
  status: CaseStatus;
  priority: CasePriority;
  progress: number; // 0–100
  openedAt: string; // ISO datetime string
  closedAt: string | null;
  riskLevel: string | null;
  finalScore: number | null;
  noteCount: number;
}

// ── Detail sub-types (GET /investigations/{id}) ───────────────────────────────

export interface InvestigationStatCards {
  status: CaseStatus;
  priority: CasePriority;
  daysOpen: number;
  progress: number;
}

export interface InvestigationDetails {
  investigatorName: string | null;
  investigatorId: string | null;
  relatedClaim: string | null; // sha_claim_id e.g. "CLM-006880"
  claimId: string | null;
  createdAt: string; // ISO datetime
  targetDate: string | null; // ISO date
  closedAt: string | null;
}

export interface EvidenceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string | null;
  uploadedBy: string | null;
  uploadedAt: string | null; // ISO datetime
}

export interface TimelineEvent {
  event: string; // "Alert created"
  actor: string | null; // "System"
  note: string | null;
  timestamp: string; // ISO datetime
}

export interface InvestigationSummary {
  alertNumber: string | null;
  alertId: string | null;
  claimNumber: string | null;
  claimId: string | null;
  providerName: string | null;
  providerId: string | null;
  investigatorName: string | null;
  investigatorId: string | null;
}

export interface InvestigationQuickActions {
  availableStatusTransitions: CaseStatus[];
  canClose: boolean;
  canUpdateProgress: boolean;
  canAssign: boolean;
  canUploadEvidence: boolean;
}

export interface CaseNote {
  id: string;
  caseId: string;
  note: string;
  createdAt: string;
  authorName: string | null;
  authorId: string | null;
}

// Fix 4: replaces flat Investigation with nested InvestigationDetail
// Fix 3: InvestigationOutcome removed — backend uses resolutionSummary + estimatedLoss
export interface InvestigationDetail {
  id: string;
  invNumber: string;
  subtitle: string; // provider name
  statCards: InvestigationStatCards;
  investigationDetails: InvestigationDetails;
  findings: string | null;
  timeline: TimelineEvent[];
  evidence: EvidenceFile[];
  summary: InvestigationSummary;
  quickActions: InvestigationQuickActions;
  notes: CaseNote[];
  status: CaseStatus;
  priority: CasePriority;
  progress: number;
  openedAt: string;
  closedAt: string | null;
  claimId: string;
  fraudScoreId: string;
  assignedAnalystId: string | null;
  resolutionSummary: string | null;
  estimatedLoss: number | null;
}

// ── Filter params ─────────────────────────────────────────────────────────────
// Fix 5: dateFrom/dateTo: Date → openedFrom/openedTo: string (ISO)
export interface InvestigationFilterParams {
  search?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  assignedTo?: string;
  openedFrom?: string;
  openedTo?: string;
}

// ── Create payload ────────────────────────────────────────────────────────────
// Fix 6: was { investigatorId, priority, targetDate, notes }
// Backend InvestigationCreate requires: claim_id, fraud_score_id; assigned_to is optional
export interface CreateInvestigationPayload {
  claimId: string; // required
  fraudScoreId: string; // required
  priority?: CasePriority;
  assignedTo?: string; // UUID of analyst (optional)
  targetDate?: string; // ISO date string
  notes?: string;
}

// ── Mutation payloads ─────────────────────────────────────────────────────────

// Fix 10: was just `status` — backend: { status, resolution_summary?, estimated_loss? }
export interface UpdateStatusPayload {
  status: CaseStatus;
  resolutionSummary?: string; // required for CONFIRMED_FRAUD | CLEARED | CLOSED
  estimatedLoss?: number;
}

// Fix 11: was (progress, notes?) — backend: { progress, findings? }
export interface UpdateProgressPayload {
  progress: number;
  findings?: string;
}

// Fix 12: was { fileName,fileType,fileUrl,uploadedBy } — backend: { file_name, file_type, file_url }
export interface UploadEvidencePayload {
  fileName: string;
  fileType: string;
  fileUrl: string;
}
