// ─── Claim domain types ───────────────────────────────────────────────────────
// Aligned to backend ClaimStatus enum, ClaimDetailResponse, and FraudAnalysis schemas.

import { RiskLevel } from '@/types/common';

export type ClaimStatus =
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'FLAGGED'
  | 'UNDER_REVIEW'
  | 'PAID';

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
  availableActions?: Array<
    'approve' | 'reject' | 'create_investigation' | 'assign'
  >;
}

export interface ClaimFilterParams {
  search?: string;
  status?: ClaimStatus;
  riskLevel?: RiskLevel;
  dateFrom?: string; // ISO date string e.g. "2024-01-01"
  dateTo?: string; // ISO date string e.g. "2024-12-31"
  county?: string;
  providerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ─── Fraud Analysis — aligned to backend FraudAnalysis + sub-schemas ──────────

export interface PhantomPatientAnalysis {
  detected: boolean;
  iprsStatus: string; // "VERIFIED" | "NOT_FOUND" | "UNVERIFIED"
  geographicAnomaly: boolean;
  visitFrequencyAnomaly: boolean;
  confidence: number; // 0–100
}

export interface DuplicateClaimAnalysis {
  detected: boolean;
  duplicateCount: number;
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
  duplicateClaim: DuplicateClaimAnalysis;
  upcoding: UpcodingAnalysis;
  providerAnomaly: ProviderAnomalyAnalysis;
  topFlags: string[];
  ruleScore: number | null;
  mlScore: number | null;
  // FIX [MINOR-2]: added — backend FraudAnalysis exposes per-detector breakdown
  detectorScores: Record<string, number> | null;
}
