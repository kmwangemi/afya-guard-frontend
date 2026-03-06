// ─── Alert domain types ───────────────────────────────────────────────────────
// Aligned to backend AlertType, AlertStatus, AlertSeverity enums and
// AlertListItem / AlertDetailResponse schemas

// Fix 1+3: was "open"|"assigned"|"investigating"|"resolved"|"closed"
// Backend AlertStatus enum is UPPERCASE, "assigned" and "closed" don't exist
export type AlertStatus =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'EXPIRED';

// Fix 2+3: completely wrong — 7 bad values. Backend has 13 UPPERCASE types
export type AlertType =
  | 'HIGH_RISK_SCORE'
  | 'CRITICAL_RISK_SCORE'
  | 'DUPLICATE_CLAIM'
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

// Fix 4: severity was RiskLevel ("low"|"medium"|"high"|"critical") imported from claim.ts
// Backend AlertSeverity is its own enum: INFO|WARNING|HIGH|CRITICAL
export type AlertSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';

// ── List item (GET /alerts) ───────────────────────────────────────────────────
export interface AlertListItem {
  id: string;
  alertNumber: string;
  typeDisplay: string; // human-readable, e.g. "Duplicate Claim"
  alertType: AlertType;
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

// Fix 5: replaces flat Alert interface with nested AlertDetail matching AlertDetailResponse
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
// Fix 6: dateFrom/dateTo → raisedFrom/raisedTo as ISO strings (not Date objects)
//        providerId/claimId removed — not query params on GET /alerts list route
export interface AlertFilterParams {
  search?: string;
  severity?: AlertSeverity;
  status?: AlertStatus;
  alertType?: AlertType;
  assignedTo?: string; // UUID string
  raisedFrom?: string; // ISO datetime string
  raisedTo?: string; // ISO datetime string
}

// ── Mutation payloads ─────────────────────────────────────────────────────────

// Fix 11: PATCH /alerts/{id}/status
export interface AlertStatusUpdatePayload {
  status: AlertStatus;
  note?: string;
  isFalsePositive?: boolean;
}

// Fix 12: PATCH /alerts/{id}/assign — backend only accepts { user_id }
// (investigatorName was wrong — not a field in AlertAssignRequest)
export interface AlertAssignPayload {
  userId: string; // UUID of the analyst
}

// Fix 13: PATCH /alerts/{id}/resolve — was { resolutionNotes, actionTaken }
// Backend AlertResolveRequest: { resolution_note, is_false_positive }
export interface AlertResolvePayload {
  resolutionNote: string; // required, min 5 chars
  isFalsePositive?: boolean;
}
