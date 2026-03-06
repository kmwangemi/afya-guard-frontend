/**
 * SHA Fraud Detection — Dashboard Service
 *
 * Replaces mockDashboardService with real API calls.
 *
 * Endpoints used:
 *   GET /api/v1/dashboard/stats            → getStats()
 *   GET /api/v1/dashboard/trend?days=N     → getTrendData()
 *   GET /api/v1/dashboard/counties?limit=N → getCountyFraudData()
 *   GET /api/v1/dashboard/critical-alerts?limit=N → getCriticalAlerts()
 *
 * All calls go through the shared `api` helper which:
 *   - Attaches the JWT Bearer token automatically
 *   - Silently refreshes on 401 and retries
 *   - Extracts `.data` so callers receive the typed payload directly
 */

import { api, handleApiError } from '@/lib/api';
import { Alert } from '@/types/alert';
import { CountyFraudData, DashboardStats, TrendData } from '@/types/common';

// ── Backend response shapes (snake_case) ──────────────────────────────────────
// These match the FastAPI Pydantic schemas exactly.
// They are mapped to the existing frontend types below.

interface BackendDashboardStats {
  totalClaimsProcessed: number; // camelCase preserved in backend schema
  flaggedClaims: number;
  criticalAlerts: number;
  estimatedFraudPrevented: number;
  totalClaimsChange: number;
  flaggedClaimsChange: number;
  criticalAlertsChange: number;
  fraudPreventedChange: number;
}

interface BackendTrendData {
  date: string; // "2026-02-04"
  totalClaims: number; // camelCase preserved
  flaggedClaims: number;
  fraudRate: number; // 0.0 – 1.0
}

interface BackendCountyFraudData {
  county: string;
  totalClaims: number; // camelCase preserved
  flaggedClaims: number;
  fraudRate: number;
  estimatedAmount: number;
}

interface BackendAlertListItem {
  id: string;
  alert_number: string; // "ALERT-00120"
  type_display: string; // "High Risk Claim"
  alert_type: string; // "HIGH_RISK_CLAIM"
  provider_name: string | null;
  provider_id: string | null;
  status: string; // "OPEN" | "ASSIGNED" | "INVESTIGATING" | ...
  severity: string; // "CRITICAL" | "HIGH" | "WARNING" | "INFO"
  fraud_amount: number | null;
  created_at: string;
  claim_id: string | null;
  sha_claim_id: string | null;
}

interface BackendRiskDistributionItem {
  label: string; // "Critical" | "High" | "Medium" | "Low"
  risk_level: string; // "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  count: number;
  percentage: number; // e.g. 2.8
  colour: string; // "purple" | "red" | "orange" | "green"
}

interface BackendRiskDistribution {
  items: BackendRiskDistributionItem[];
  total_claims: number;
}

interface BackendPaginatedAlerts {
  items: BackendAlertListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ── Field mappers ─────────────────────────────────────────────────────────────

/**
 * Map backend alert_type enum → frontend Alert.type values.
 * Backend: HIGH_RISK_CLAIM, PHANTOM_PATIENT, UPCODING, DUPLICATE_CLAIM, etc.
 * Frontend Alert type: "high_risk_claim" | "phantom_patient" | ...
 */
function mapAlertType(backendType: string): Alert['type'] {
  return backendType.toLowerCase() as Alert['type'];
}

/**
 * Map backend severity enum → frontend Alert.severity values.
 * Backend: CRITICAL | HIGH | WARNING | INFO
 * Frontend: "critical" | "high" | "medium" | "low"
 */
function mapSeverity(backendSeverity: string): Alert['severity'] {
  const map: Record<string, Alert['severity']> = {
    CRITICAL: 'critical',
    HIGH: 'high',
    WARNING: 'medium',
    INFO: 'low',
  };
  return map[backendSeverity] ?? 'low';
}

/**
 * Map backend status enum → frontend Alert.status values.
 * Backend: OPEN | ASSIGNED | INVESTIGATING | ESCALATED | RESOLVED | EXPIRED
 * Frontend: "open" | "assigned" | "investigating" | "resolved"
 */
function mapStatus(backendStatus: string): Alert['status'] {
  const map: Record<string, Alert['status']> = {
    OPEN: 'open',
    ASSIGNED: 'assigned',
    INVESTIGATING: 'investigating',
    ESCALATED: 'investigating',
    RESOLVED: 'resolved',
    EXPIRED: 'resolved',
  };
  return map[backendStatus] ?? 'open';
}

/**
 * Transform a BackendAlertListItem into the frontend Alert shape.
 * Fields that have no backend equivalent are given safe defaults.
 */
function mapAlert(a: BackendAlertListItem): Alert {
  return {
    id: a.id,
    alertNumber: a.alert_number,
    claimId: a.claim_id ?? '',
    claimNumber: a.sha_claim_id ?? '',
    providerId: a.provider_id ?? '',
    providerName: a.provider_name ?? '',
    type: mapAlertType(a.alert_type),
    severity: mapSeverity(a.severity),
    status: mapStatus(a.status),
    title: a.type_display,
    description: a.type_display,
    riskScore: 0, // not included in list view; fetch detail for this
    estimatedFraudAmount: a.fraud_amount ?? 0,
    assignedToName: undefined, // not returned in list endpoint
    createdAt: new Date(a.created_at),
    updatedAt: new Date(a.created_at),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const dashboardService = {
  /**
   * Four stat cards — Total Claims Processed, Flagged Claims,
   * Critical Alerts, Estimated Fraud Prevented.
   *
   * Backend:  GET /api/v1/dashboard/stats
   * Response: BackendDashboardStats (camelCase matches TS interface directly)
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const data = await api.get<BackendDashboardStats>('/dashboard/stats');
      // Backend field names already match DashboardStats exactly.
      // We pick only what the interface requires and drop the extra
      // change fields (pass them through if your DashboardStats type grows).
      return {
        totalClaimsProcessed: data.totalClaimsProcessed,
        flaggedClaims: data.flaggedClaims,
        criticalAlerts: data.criticalAlerts,
        estimatedFraudPrevented: data.estimatedFraudPrevented,
        // Change % fields — used by stat card arrows
        totalClaimsChange: data.totalClaimsChange,
        flaggedClaimsChange: data.flaggedClaimsChange,
        criticalAlertsChange: data.criticalAlertsChange,
        fraudPreventedChange: data.fraudPreventedChange,
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Daily trend data for the 30-day chart.
   *
   * Backend:  GET /api/v1/dashboard/trend?days=N
   * Response: BackendTrendData[] (camelCase matches TrendData interface directly)
   */
  getTrendData: async (days: number = 30): Promise<TrendData[]> => {
    try {
      const data = await api.get<BackendTrendData[]>('/dashboard/trend', {
        params: { days },
      });
      // Backend field names already match TrendData — no transformation needed.
      return data.map(d => ({
        date: d.date,
        totalClaims: d.totalClaims,
        flaggedClaims: d.flaggedClaims,
        fraudRate: d.fraudRate,
      }));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Top counties by fraud rate for the county table.
   *
   * Backend:  GET /api/v1/dashboard/counties?limit=N
   * Response: BackendCountyFraudData[] (camelCase matches CountyFraudData directly)
   */
  getCountyFraudData: async (
    limit: number = 10,
  ): Promise<CountyFraudData[]> => {
    try {
      const data = await api.get<BackendCountyFraudData[]>(
        '/dashboard/counties',
        {
          params: { limit },
        },
      );
      // Backend field names already match CountyFraudData — no transformation needed.
      return data.map(d => ({
        county: d.county,
        totalClaims: d.totalClaims,
        flaggedClaims: d.flaggedClaims,
        fraudRate: d.fraudRate,
        estimatedAmount: d.estimatedAmount,
      }));
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Recent CRITICAL alerts for the bottom dashboard table.
   *
   * Backend:  GET /api/v1/dashboard/critical-alerts?limit=N
   * Response: PaginatedResponse<AlertListItem>
   *
   * The backend AlertListItem uses snake_case; mapAlert() converts
   * each item to the frontend Alert shape.
   */
  getCriticalAlerts: async (limit: number = 10): Promise<Alert[]> => {
    try {
      const data = await api.get<BackendPaginatedAlerts>(
        '/dashboard/critical-alerts',
        { params: { limit } },
      );
      return data.items.map(mapAlert);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Risk distribution panel — Critical / High / Medium / Low counts + percentages.
   *
   * Backend:  GET /api/v1/dashboard/risk-distribution
   */
  getRiskDistribution: async () => {
    try {
      const data = await api.get<BackendRiskDistribution>(
        '/dashboard/risk-distribution',
      );
      return {
        items: data.items, // label, risk_level, count, percentage, colour
        totalClaims: data.total_claims,
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Full dashboard in one call — use this on page load to avoid
   * 4 separate waterfall requests.
   *
   * Backend:  GET /api/v1/dashboard?trend_days=N
   *
   * Returns all four widgets at once; the caller can destructure
   * what it needs.
   */
  getDashboard: async (trendDays: number = 30) => {
    try {
      const data = await api.get<{
        stats: BackendDashboardStats;
        trend: BackendTrendData[];
        top_counties: BackendCountyFraudData[];
        risk_distribution: BackendRiskDistribution;
      }>('/dashboard', { params: { trend_days: trendDays } });
      return {
        stats: {
          totalClaimsProcessed: data.stats.totalClaimsProcessed,
          flaggedClaims: data.stats.flaggedClaims,
          criticalAlerts: data.stats.criticalAlerts,
          estimatedFraudPrevented: data.stats.estimatedFraudPrevented,
        } as DashboardStats,
        trend: data.trend.map(d => ({
          date: d.date,
          totalClaims: d.totalClaims,
          flaggedClaims: d.flaggedClaims,
          fraudRate: d.fraudRate,
        })) as TrendData[],
        counties: data.top_counties.map(d => ({
          county: d.county,
          totalClaims: d.totalClaims,
          flaggedClaims: d.flaggedClaims,
          fraudRate: d.fraudRate,
          estimatedAmount: d.estimatedAmount,
        })) as CountyFraudData[],
        riskDistribution: {
          items: data.risk_distribution.items,
          totalClaims: data.risk_distribution.total_claims,
        },
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
};
