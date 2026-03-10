import { api } from '@/lib/api';
import {
  AlertAssignPayload,
  AlertDetail,
  AlertFilterParams,
  AlertListItem,
  AlertResolvePayload,
  AlertSeverity,
  AlertStatus,
  AlertStatusUpdatePayload,
  AlertType,
} from '@/types/alert';
import { PaginatedResponse } from '@/types/common';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface ApiAlertListItem {
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

interface ApiAlertDetail {
  id: string;
  alert_number: string;
  subtitle: string;
  alert_summary: {
    alert_type: string;
    type_display: string;
    severity: string;
    status: string;
    created_at: string;
  };
  related_claim: {
    claim_id: string;
    sha_claim_id: string;
    provider_id: string | null;
    provider_name: string | null;
  } | null;
  description: string | null;
  fraud_analysis: {
    estimated_fraud_amount: number | null;
    risk_score_percentage: number | null;
  };
  available_status_transitions: string[];
  assigned_to: {
    user_id: string;
    full_name: string;
    role: string | null;
    avatar_initial: string;
  } | null;
  timeline: {
    label: string;
    timestamp: string;
    note: string | null;
  }[];
  alert_type: string;
  severity: string;
  status: string;
  fraud_case_id: string | null;
}

interface ApiPaginatedAlerts {
  items: ApiAlertListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapListItem(a: ApiAlertListItem): AlertListItem {
  return {
    id: a.id,
    alertNumber: a.alert_number,
    typeDisplay: a.type_display,
    alertType: a.alert_type as AlertType,
    providerName: a.provider_name,
    providerId: a.provider_id,
    status: a.status as AlertStatus,
    severity: a.severity as AlertSeverity,
    fraudAmount: a.fraud_amount,
    createdAt: a.created_at,
    claimId: a.claim_id,
    shaClaimId: a.sha_claim_id,
  };
}

function mapDetail(a: ApiAlertDetail): AlertDetail {
  return {
    id: a.id,
    alertNumber: a.alert_number,
    subtitle: a.subtitle,
    alertSummary: {
      alertType: a.alert_summary.alert_type as AlertType,
      typeDisplay: a.alert_summary.type_display,
      severity: a.alert_summary.severity as AlertSeverity,
      status: a.alert_summary.status as AlertStatus,
      createdAt: a.alert_summary.created_at,
    },
    relatedClaim: a.related_claim
      ? {
          claimId: a.related_claim.claim_id,
          shaClaimId: a.related_claim.sha_claim_id,
          providerId: a.related_claim.provider_id,
          providerName: a.related_claim.provider_name,
        }
      : null,
    description: a.description,
    fraudAnalysis: {
      estimatedFraudAmount: a.fraud_analysis.estimated_fraud_amount,
      riskScorePercentage: a.fraud_analysis.risk_score_percentage,
    },
    availableStatusTransitions: a.available_status_transitions as AlertStatus[],
    assignedTo: a.assigned_to
      ? {
          userId: a.assigned_to.user_id,
          fullName: a.assigned_to.full_name,
          role: a.assigned_to.role,
          avatarInitial: a.assigned_to.avatar_initial,
        }
      : null,
    timeline: a.timeline.map(t => ({
      label: t.label,
      timestamp: t.timestamp,
      note: t.note,
    })),
    alertType: a.alert_type as AlertType,
    severity: a.severity as AlertSeverity,
    status: a.status as AlertStatus,
    fraudCaseId: a.fraud_case_id,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const alertsService = {
  // GET /api/v1/alerts
  // Route accepts: search, severity, status, alert_type, page, page_size ONLY.
  // FIX [CRITICAL-1]: removed assigned_to, raised_from, raised_to — the route handler
  // does NOT declare these as Query() params; they exist only on the internal
  // AlertListFilter schema and are silently ignored by FastAPI.
  getAlerts: async (
    filters: AlertFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<AlertListItem>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.severity) params.set('severity', filters.severity);
    if (filters.status) params.set('status', filters.status);
    if (filters.alertType) params.set('alert_type', filters.alertType);
    const response = await api.get<ApiPaginatedAlerts>(`/alerts?${params}`);
    return {
      data: response.items.map(mapListItem),
      pagination: {
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.pages,
        hasMore: response.page < response.pages,
      },
    };
  },
  // GET /api/v1/alerts/{id}
  getAlertById: async (id: string): Promise<AlertDetail> => {
    const detail = await api.get<ApiAlertDetail>(`/alerts/${id}`);
    return mapDetail(detail);
  },
  // No getCriticalAlerts endpoint — use GET /alerts?severity=CRITICAL
  getCriticalAlerts: async (limit: number = 10): Promise<AlertListItem[]> => {
    const params = new URLSearchParams();
    params.set('severity', 'CRITICAL');
    params.set('page_size', String(limit));
    const response = await api.get<ApiPaginatedAlerts>(`/alerts?${params}`);
    return response.items.map(mapListItem);
  },
  // PATCH /alerts/{id}/status — { status, note, is_false_positive }
  updateAlertStatus: async (
    id: string,
    payload: AlertStatusUpdatePayload,
  ): Promise<AlertDetail> => {
    const detail = await api.patch<ApiAlertDetail>(`/alerts/${id}/status`, {
      status: payload.status,
      note: payload.note,
      is_false_positive: payload.isFalsePositive,
    });
    return mapDetail(detail);
  },
  // PATCH /alerts/{id}/acknowledge — { note? }
  acknowledgeAlert: async (id: string, note?: string): Promise<AlertDetail> => {
    const detail = await api.patch<ApiAlertDetail>(
      `/alerts/${id}/acknowledge`,
      { note },
    );
    return mapDetail(detail);
  },
  // PATCH /alerts/{id}/resolve — { resolution_note, is_false_positive }
  resolveAlert: async (
    id: string,
    payload: AlertResolvePayload,
  ): Promise<AlertDetail> => {
    const detail = await api.patch<ApiAlertDetail>(`/alerts/${id}/resolve`, {
      resolution_note: payload.resolutionNote,
      is_false_positive: payload.isFalsePositive ?? false,
    });
    return mapDetail(detail);
  },
  // PATCH /alerts/{id}/assign — { user_id }
  assignAlert: async (
    id: string,
    payload: AlertAssignPayload,
  ): Promise<AlertDetail> => {
    const detail = await api.patch<ApiAlertDetail>(`/alerts/${id}/assign`, {
      user_id: payload.userId,
    });
    return mapDetail(detail);
  },
};
