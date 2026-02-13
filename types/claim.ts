export type ClaimStatus = "pending" | "approved" | "rejected" | "flagged" | "under_investigation";

export type RiskLevel = "low" | "medium" | "high" | "critical";

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
  patientId: string; // Will be masked in UI
  amount: number;
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
  claimAmount: number;
  approvedAmount?: number;
  rejectedAmount?: number;
  notes?: string;
}

export interface ClaimFilterParams {
  search?: string;
  status?: ClaimStatus;
  riskLevel?: RiskLevel;
  dateFrom?: Date;
  dateTo?: Date;
  county?: string;
  providerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ClaimAnalysis {
  phantomPatient: {
    iprsFlag: boolean;
    geographicAnomaly: boolean;
    visitFrequencyAnomaly: boolean;
    iprsStatus?: string;
    evidence: string[];
  };
  upcoding: {
    detected: boolean;
    confidence: number;
    diagnosisProcedureMatch: boolean;
    mlDetectionScore: number;
    statisticalOutlier: boolean;
    evidence: string[];
  };
  duplicateDetection: {
    exactMatches: number;
    fuzzyMatches: number;
    relatedClaims: string[];
  };
}
