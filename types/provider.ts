// Fix 11: backend FacilityType enum is UPPERCASE
export type FacilityType =
  | 'PUBLIC_HOSPITAL'
  | 'PRIVATE_HOSPITAL'
  | 'FAITH_BASED'
  | 'CLINIC'
  | 'LABORATORY'
  | 'PHARMACY'
  | 'SPECIALIST_CENTER';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AccreditationStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'PENDING';

// ── List item (GET /providers) ────────────────────────────────────────────────
export interface ProviderListItem {
  id: string;
  shaProviderCode: string;
  name: string;
  facilityType: FacilityType | null;
  county: string | null;
  totalClaims: number;
  flaggedPercentage: number; // e.g. 0.9 → display as "0.9%"
  riskScore: number | null;
  riskLevel: RiskLevel | null;
  accreditationStatus: AccreditationStatus | null;
  highRiskFlag: boolean;
}

// ── Detail response sub-types (GET /providers/{id}) ───────────────────────────
export interface ProviderHeaderStats {
  riskScore: number | null;
  riskLevel: RiskLevel | null;
  totalClaims: number;
  flaggedClaimsPercentage: number;
  confirmedFraudCount: number;
}

export interface ProviderInformation {
  facilityType: FacilityType | null;
  county: string | null;
  phone: string | null;
  email: string | null;
  bedCapacity: number | null;
  status: AccreditationStatus | null;
}

export interface RiskProfileBar {
  label: string;
  value: number; // 0–100
  colour: string; // "red" | "orange" | "purple"
}

export interface RiskProfile {
  claimDeviation: RiskProfileBar;
  rejectionRate: RiskProfileBar;
  fraudHistoryScore: RiskProfileBar;
}

export interface QuickStats {
  totalClaims: number;
  flagged: number;
  confirmedFraud: number;
  lastClaimDate: string | null; // ISO date string
}

export interface FraudHistory {
  confirmedCases: number;
  suspectedCases: number;
  totalFraudAmount: number;
}

export interface ProviderStatistics {
  totalAmount: number;
  averageClaim: number;
  rejectionRate: number;
  avgProcessingTimeDays: number;
}

// ── Full detail type ──────────────────────────────────────────────────────────
export interface ProviderDetail {
  id: string;
  shaProviderCode: string;
  name: string;
  header: ProviderHeaderStats;
  providerInformation: ProviderInformation;
  riskProfile: RiskProfile;
  statistics: ProviderStatistics;
  quickStats: QuickStats;
  fraudHistory: FraudHistory;
  subCounty: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// ── Filter params ─────────────────────────────────────────────────────────────
export interface ProviderFilterParams {
  search?: string;
  county?: string;
  facilityType?: FacilityType;
  riskLevel?: RiskLevel;
}

// ── Create payload ────────────────────────────────────────────────────────────
export interface ProviderCreateParams {
  shaProviderCode: string; // required by backend
  name: string;
  county?: string;
  facilityType?: FacilityType;
  phone?: string;
  email?: string;
  bedCapacity?: number;
}
