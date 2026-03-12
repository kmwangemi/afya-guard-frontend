// ─── Alert domain types ───────────────────────────────────────────────────────
// Aligned to backend AlertType, AlertStatus, AlertSeverity enums and
// AlertListItem / AlertDetailResponse schemas

export type AlertStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'EXPIRED';

export type AlertType =
  | 'HIGH_RISK_SCORE'
  | 'CRITICAL_RISK_SCORE'
  | 'DUPLICATE_CLAIM'
  | 'GHOST_PROVIDER'
  | 'PHANTOM_PATIENT'
  | 'UPCODING_DETECTED'
  | 'PROVIDER_ANOMALY'
  | 'RULE_THRESHOLD_BREACH'
  | 'MEMBER_FREQUENCY_ABUSE'
  | 'PROVIDER_CLAIM_SPIKE'
  | 'LATE_NIGHT_SUBMISSION'
  | 'BULK_SUBMISSION'
  | 'MODEL_CONFIDENCE_LOW'
  | 'RESUBMISSION_PATTERN';

export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

// ── List item (GET /alerts) ───────────────────────────────────────────────────
export interface AlertListItem {
  id: string;
  alertNumber: string;
  typeDisplay: string;
  alertType: AlertType;
  claimNumber: string;
  providerName: string | null;
  providerId: string | null;
  status: AlertStatus;
  severity: AlertSeverity;
  fraudAmount: number | null;
  createdAt: string; // ISO datetime string
  claimId: string | null;
  shaClaimId: string | null;
}

// ── Detail sub-types (GET /alerts/{id}) ───────────────────────────────────────

export interface AlertSummary {
  alertType: AlertType;
  typeDisplay: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
}

export interface RelatedClaim {
  claimId: string;
  shaClaimId: string;
  providerId: string | null;
  providerName: string | null;
}

export interface AlertFraudAnalysis {
  estimatedFraudAmount: number | null;
  riskScorePercentage: number | null;
}

export interface AssignedAnalyst {
  userId: string;
  fullName: string;
  role: string | null;
  avatarInitial: string;
}

export interface TimelineEvent {
  label: string;
  timestamp: string;
  note: string | null;
}

export interface AlertDetail {
  id: string;
  alertNumber: string;
  subtitle: string;
  alertSummary: AlertSummary;
  relatedClaim: RelatedClaim | null;
  description: string | null;
  fraudAnalysis: AlertFraudAnalysis;
  availableStatusTransitions: AlertStatus[];
  assignedTo: AssignedAnalyst | null;
  timeline: TimelineEvent[];
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  fraudCaseId: string | null;
}

// ── Filter params ─────────────────────────────────────────────────────────────
export interface AlertFilterParams {
  search?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  // FIX [WRONG-1]: added alertType — was missing but used in alertsService.getAlerts()
  alertType?: AlertType;
  assignedTo?: string; // UUID string
  raisedFrom?: string; // ISO datetime string
  raisedTo?: string; // ISO datetime string
}

// ── Mutation payloads ─────────────────────────────────────────────────────────

export interface AlertStatusUpdatePayload {
  status: AlertStatus;
  note?: string;
  isFalsePositive?: boolean;
}

// Backend only accepts { user_id }
export interface AlertAssignPayload {
  userId: string;
}

// Backend AlertResolveRequest: { resolution_note, is_false_positive }
export interface AlertResolvePayload {
  resolutionNote: string; // required, min 5 chars
  isFalsePositive?: boolean;
}
