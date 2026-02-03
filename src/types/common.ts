export interface DashboardStats {
  total_claims: number;
  flagged_claims: number;
  critical_alerts: number;
  estimated_fraud_amount: number;
  claims_by_risk: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  fraud_trend: TrendData[];
  top_providers_at_risk: ProviderRiskData[];
}

export interface TrendData {
  date: string;
  total_claims: number;
  flagged_claims: number;
  fraud_rate: number;
}

export interface ProviderRiskData {
  id: number;
  name: string;
  risk_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flagged_claims: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
