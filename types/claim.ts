// ─── Claim domain types ───────────────────────────────────────────────────────
// Aligned to backend ClaimStatus enum, ClaimDetailResponse, and FraudAnalysis schemas.

// Fix 1: "under_investigation" → "under_review" to match backend UNDER_REVIEW enum
// Fix 2: added "paid" which the backend supports
export type ClaimStatus =
  | 'pending' // SUBMITTED
  | 'approved' // APPROVED
  | 'rejected' // REJECTED
  | 'flagged' // FLAGGED
  | 'under_review' // UNDER_REVIEW  ← was "under_investigation"
  | 'paid'; // PAID

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface FraudFlag {
  id: string;
  type: string;
  severity: RiskLevel;
  description: string;
  evidence?: string;
  timestamp: Date;
}

export interface Claim {
  id: string;
  claimNumber: string;
  providerId: string;
  providerName: string;
  patientId: string; // masked in UI
  amount: number;
  claimAmount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  serviceDateStart: Date;
  serviceDateEnd: Date;
  diagnosis: string;
  procedure: string;
  status: ClaimStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  fraudFlags: FraudFlag[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date;
  countyCode: string;
  countyName: string;
  facilityType: string;
  notes?: string;
  // Backend-driven: which action buttons to show for this claim's current state
  availableActions?: Array<
    'approve' | 'reject' | 'create_investigation' | 'assign'
  >;
}

// Fix 3: dateFrom/dateTo must be string — Date objects cannot be serialised as URL query params
export interface ClaimFilterParams {
  search?: string;
  status?: ClaimStatus;
  riskLevel?: RiskLevel;
  dateFrom?: string; // ISO date string e.g. "2024-01-01"  ← was Date
  dateTo?: string; // ISO date string e.g. "2024-12-31"  ← was Date
  county?: string;
  providerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ─── Fraud Analysis — aligned to backend FraudAnalysis + sub-schemas ──────────

export interface PhantomPatientAnalysis {
  detected: boolean; // ← was iprsFlag (wrong name)
  iprsStatus: string; // "VERIFIED" | "NOT_FOUND" | "UNVERIFIED"
  geographicAnomaly: boolean;
  visitFrequencyAnomaly: boolean;
  confidence: number; // 0–100
}

export interface DuplicateClaimAnalysis {
  detected: boolean;
  duplicateCount: number; // ← was exactMatches+fuzzyMatches (split doesn't exist in backend)
  duplicateClaimIds: string[];
  sameProvider: boolean;
  windowDays: number;
  confidence: number;
}

export interface UpcodingAnalysis {
  detected: boolean;
  flaggedServiceCodes: string[];
  flagReasons: string[];
  confidence: number; // e.g. 14.9 (%)
  // mlDetectionScore and diagnosisProcedureMatch removed — not in backend schema
}

export interface ProviderAnomalyAnalysis {
  detected: boolean;
  providerVsPeerRatio: number | null;
  highRiskFlag: boolean;
  confidence: number;
}

export interface ClaimAnalysis {
  overallScore: number | null;
  riskLevel: RiskLevel | null;
  phantomPatient: PhantomPatientAnalysis;
  duplicateClaim: DuplicateClaimAnalysis; // ← was duplicateDetection
  upcoding: UpcodingAnalysis;
  providerAnomaly: ProviderAnomalyAnalysis; // ← was missing
  topFlags: string[]; // ← was missing
  ruleScore: number | null;
  mlScore: number | null;
}
