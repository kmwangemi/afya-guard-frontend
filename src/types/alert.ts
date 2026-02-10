import type { Claim } from '@/types/claim';

export interface Alert {
  id: number;
  claim_id: number;
  claim?: Claim;
  alert_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score?: number;
  description: string;
  evidence: Record<string, string | number | boolean | object>;
  assigned_to?: number;
  assigned_to_name?: string;
  status: AlertStatus;
  priority: number;
  estimated_fraud_amount?: number;
  created_at: string;
  updated_at: string;
}

export type AlertStatus =
  | 'open'
  | 'assigned'
  | 'investigating'
  | 'resolved'
  | 'false_positive';
