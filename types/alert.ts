import { RiskLevel } from "./claim";

export type AlertStatus = "open" | "assigned" | "investigating" | "resolved" | "closed";

export type AlertType =
  | "high_risk_claim"
  | "phantom_patient"
  | "upcoding"
  | "duplicate_claim"
  | "provider_anomaly"
  | "volume_spike"
  | "pattern_detected";

export interface Alert {
  id: string;
  alertNumber: string;
  claimId: string;
  claimNumber: string;
  providerId: string;
  providerName: string;
  type: AlertType;
  severity: RiskLevel;
  status: AlertStatus;
  title: string;
  description: string;
  riskScore: number;
  estimatedFraudAmount: number;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolutionNotes?: string;
  investigationId?: string;
  actionTaken?: string;
}

export interface AlertFilterParams {
  severity?: RiskLevel;
  status?: AlertStatus;
  type?: AlertType;
  dateFrom?: Date;
  dateTo?: Date;
  assignedTo?: string;
  providerId?: string;
  claimId?: string;
}

export interface AlertSort {
  field: "severity" | "createdAt" | "estimatedFraudAmount";
  direction: "asc" | "desc";
}
