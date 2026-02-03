export interface Provider {
  id: number;
  provider_code: string;
  name: string;
  facility_type: string;
  county: string;
  sub_county?: string;
  phone?: string;
  email?: string;
  physical_address?: string;
  bed_capacity?: number;
  accreditation_status: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  total_claims: number;
  flagged_claims: number;
  confirmed_fraud_cases: number;
  is_active: boolean;
  created_at: string;
}

export interface ProviderStatistics {
  total_claims: number;
  total_amount: number;
  avg_claim_amount: number;
  flagged_claims: number;
  flagged_amount: number;
  fraud_rate: number;
  claims_by_month: MonthlyData[];
  top_procedures: ProcedureData[];
}

export interface MonthlyData {
  month: string;
  count: number;
  amount: number;
}

export interface ProcedureData {
  procedure_code: string;
  procedure_name: string;
  count: number;
  amount: number;
}
