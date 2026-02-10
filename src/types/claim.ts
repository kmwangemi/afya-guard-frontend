export interface Claim {
  id: number;
  claim_number: string;
  patient_national_id: string;
  provider_id: string;
  provider_name?: string;
  diagnosis_code: string;
  diagnosis_name?: string;
  procedure_code: string;
  procedure_name?: string;
  claim_amount: number;
  service_date: string;
  submission_date: string;
  status: ClaimStatus;
  risk_score: number;
  is_flagged: boolean;
  fraud_flags: FraudFlag[];
  created_at: string;
  updated_at: string;
}

export type ClaimStatus =
  | 'pending'
  | 'processing'
  | 'auto_approved'
  | 'flagged_critical'
  | 'flagged_review'
  | 'approved'
  | 'rejected';

export interface FraudFlag {
  type: FraudFlagType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  score: number;
  evidence?: Record<string, string | number | boolean | object>;
}

export type FraudFlagType =
  | 'iprs_mismatch'
  | 'deceased_patient'
  | 'geographic_impossibility'
  | 'excessive_visits'
  | 'diagnosis_procedure_mismatch'
  | 'ml_upcoding_detected'
  | 'statistical_outlier'
  | 'peer_comparison_anomaly'
  | 'exact_duplicate'
  | 'fuzzy_duplicate';
