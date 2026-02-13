export interface DashboardStats {
  totalClaimsProcessed: number;
  flaggedClaims: number;
  criticalAlerts: number;
  estimatedFraudPrevented: number;
}

export interface TrendData {
  date: string;
  totalClaims: number;
  flaggedClaims: number;
  fraudRate: number;
}

export interface CountyFraudData {
  county: string;
  totalClaims: number;
  flaggedClaims: number;
  fraudRate: number;
  estimatedAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface FilterParams {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface ChartData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

export type SortOrder = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortOrder;
}
