import { RiskLevel } from "./claim";

export type FacilityType =
  | "hospital"
  | "clinic"
  | "diagnostic"
  | "laboratory"
  | "pharmacy"
  | "other";

export type AccreditationStatus = "active" | "suspended" | "revoked" | "pending";

export interface ProviderStatistics {
  totalClaims: number;
  totalAmount: number;
  averageAmount: number;
  flaggedClaims: number;
  flaggedPercentage: number;
  confirmedFraud: number;
  rejectionRate: number;
  averageProcessingTime: number;
}

export interface RiskProfile {
  claimDeviation: number;
  rejectionRate: number;
  procedureDiversity: number;
  volumeAnomaly: number;
  fraudHistory: number;
  overall: number;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  facilityType: FacilityType;
  countyCode: string;
  countyName: string;
  subcounty: string;
  location: string;
  contact: string;
  email?: string;
  phone?: string;
  bedCapacity?: number;
  accreditationStatus: AccreditationStatus;
  accreditationNumber?: string;
  active: boolean;
  riskScore: number;
  riskLevel: RiskLevel;
  riskProfile: RiskProfile;
  statistics: ProviderStatistics;
  createdAt: Date;
  updatedAt: Date;
  lastClaimDate: Date;
  fraudHistory?: {
    confirmedCases: number;
    suspectedCases: number;
    totalAmount: number;
    lastInvestigation?: Date;
  };
}

export interface ProviderFilterParams {
  search?: string;
  county?: string;
  facilityType?: FacilityType;
  riskLevel?: RiskLevel;
  accreditationStatus?: AccreditationStatus;
}

export interface ProviderSort {
  field: "riskScore" | "claimsVolume" | "fraudRate" | "name";
  direction: "asc" | "desc";
}
