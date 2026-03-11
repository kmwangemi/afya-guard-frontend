/**
 * SHA Fraud Detection — Dashboard Service
 *
 * Endpoints used:
 *   GET /api/v1/dashboard/stats              → getStats()
 *   GET /api/v1/dashboard/trend?days=N       → getTrendData()
 *   GET /api/v1/dashboard/counties?limit=N   → getCountyFraudData()
 *   GET /api/v1/dashboard/critical-alerts?limit=N → getCriticalAlerts()
 *   GET /api/v1/dashboard/risk-distribution  → getRiskDistribution()
 *   GET /api/v1/dashboard?trend_days=N       → getDashboard()
 */

import { api, handleApiError } from '@/lib/api';
import {
  AlertListItem,
  AlertSeverity,
  AlertStatus,
  AlertType,
} from '@/types/alert';
import { CountyFraudData, DashboardStats, TrendData } from '@/types/common';

// ── Backend response shapes (snake_case) ──────────────────────────────────────

interface BackendDashboardStats {
  totalClaimsProcessed: number;
  flaggedClaims: number;
  criticalAlerts: number;
  estimatedFraudPrevented: number;
  totalClaimsChange: number;
  flaggedClaimsChange: number;
  criticalAlertsChange: number;
  fraudPreventedChange: number;
}

interface BackendTrendData {
  date: string;
  totalClaims: number;
  flaggedClaims: number;
  fraudRate: number;
}

interface BackendCountyFraudData {
  county: string;
  totalClaims: number;
  flaggedClaims: number;
  fraudRate: number;
  estimatedAmount: number;
}

interface BackendAlertListItem {
  id: string;
  alert_number: string;
  type_display: string;
  alert_type: string;
  provider_name: string | null;
  provider_id: string | null;
  status: string;
  severity: string;
  fraud_amount: number | null;
  created_at: string;
  claim_id: string | null;
  sha_claim_id: string | null;
}

interface BackendRiskDistributionItem {
  label: string;
  risk_level: string;
  count: number;
  percentage: number;
  colour: string;
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

function mapSeverity(backendSeverity: string): AlertSeverity {
  const map: Record<string, AlertSeverity> = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    WARNING: 'WARNING',
    INFO: 'INFO',
  };
  return map[backendSeverity] ?? 'INFO';
}

function mapStatus(backendStatus: string): AlertStatus {
  const map: Record<string, AlertStatus> = {
    OPEN: 'OPEN',
    ASSIGNED: 'OPEN', // no ASSIGNED in frontend type — fallback to OPEN
    ACKNOWLEDGED: 'ACKNOWLEDGED',
    INVESTIGATING: 'INVESTIGATING',
    ESCALATED: 'ESCALATED',
    RESOLVED: 'RESOLVED',
    EXPIRED: 'EXPIRED',
  };
  return map[backendStatus] ?? 'OPEN';
}

function mapAlert(a: BackendAlertListItem): AlertListItem {
  return {
    id: a.id,
    alertNumber: a.alert_number,
    typeDisplay: a.type_display,
    alertType: a.alert_type as AlertType,
    providerName: a.provider_name,
    providerId: a.provider_id,
    status: mapStatus(a.status),
    severity: mapSeverity(a.severity),
    fraudAmount: a.fraud_amount,
    createdAt: a.created_at,
    claimId: a.claim_id,
    shaClaimId: a.sha_claim_id,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const dashboardService = {
  /**
   * Four stat cards — Total Claims Processed, Flagged Claims,
   * Critical Alerts, Estimated Fraud Prevented.
   *
   * Backend: GET /api/v1/dashboard/stats
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const data = await api.get<BackendDashboardStats>('/dashboard/stats');
      return {
        totalClaimsProcessed: data.totalClaimsProcessed,
        flaggedClaims: data.flaggedClaims,
        criticalAlerts: data.criticalAlerts,
        estimatedFraudPrevented: data.estimatedFraudPrevented,
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
   * Backend: GET /api/v1/dashboard/trend?days=N
   */
  getTrendData: async (days: number = 30): Promise<TrendData[]> => {
    try {
      const data = await api.get<BackendTrendData[]>('/dashboard/trend', {
        params: { days },
      });
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
   * Backend: GET /api/v1/dashboard/counties?limit=N
   */
  getCountyFraudData: async (
    limit: number = 10,
  ): Promise<CountyFraudData[]> => {
    try {
      const data = await api.get<BackendCountyFraudData[]>(
        '/dashboard/counties',
        { params: { limit } },
      );
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
   * Backend: GET /api/v1/dashboard/critical-alerts?limit=N
   */
  getCriticalAlerts: async (limit: number = 10): Promise<AlertListItem[]> => {
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
   * Backend: GET /api/v1/dashboard/risk-distribution
   */
  getRiskDistribution: async () => {
    try {
      const data = await api.get<BackendRiskDistribution>(
        '/dashboard/risk-distribution',
      );
      return {
        items: data.items,
        totalClaims: data.total_claims,
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  /**
   * Full dashboard in one call — avoids 4 separate waterfall requests.
   *
   * Backend: GET /api/v1/dashboard?trend_days=N
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
          totalClaimsChange: data.stats.totalClaimsChange,
          flaggedClaimsChange: data.stats.flaggedClaimsChange,
          criticalAlertsChange: data.stats.criticalAlertsChange,
          fraudPreventedChange: data.stats.fraudPreventedChange,
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
