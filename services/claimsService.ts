import { api, apiClient } from '@/lib/api';
import {
  Claim,
  ClaimAnalysis,
  ClaimFilterParams,
  ClaimStatus,
} from '@/types/claim';
import { PaginatedResponse } from '@/types/common';

// ─── Backend response shapes ──────────────────────────────────────────────────

// GET /claims — list item (ClaimListItem)
interface ApiClaimListItem {
  id: string;
  sha_claim_id: string;
  provider_name: string | null;
  provider_id_code: string | null;
  member_sha_id_masked: string | null;
  total_claim_amount: number | null;
  service_date: string | null;
  risk_score: number | null;
  risk_level: string | null;
  status: string; // ClaimStatus enum value e.g. "SUBMITTED"
}

// GET /claims/{id} — full detail (ClaimDetailResponse)
interface ApiClaimDetail {
  id: string;
  sha_claim_id: string;
  provider_name: string | null;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  claim_amount: number | null;
  service_date: string | null;
  claim_type: string | null;
  available_actions: string[];
  claim_information: {
    patient_id_masked: string;
    provider_id: string;
    provider_name: string | null;
    county: string | null;
    diagnosis_codes: string[];
    service_date_start: string | null;
    service_date_end: string | null;
    facility_type: string | null;
  };
  fraud_analysis: {
    overall_score: number | null;
    risk_level: string | null;
    phantom_patient: {
      detected: boolean;
      iprs_status: string;
      geographic_anomaly: boolean;
      visit_frequency_anomaly: boolean;
      confidence: number;
    };
    duplicate_claim: {
      detected: boolean;
      duplicate_count: number;
      duplicate_claim_ids: string[];
      same_provider: boolean;
      window_days: number;
      confidence: number;
    };
    upcoding: {
      detected: boolean;
      flagged_service_codes: string[];
      flag_reasons: string[];
      confidence: number;
    };
    provider_anomaly: {
      detected: boolean;
      provider_vs_peer_ratio: number | null;
      high_risk_flag: boolean;
      confidence: number;
    };
    top_flags: string[];
    rule_score: number | null;
    ml_score: number | null;
  };
  details: {
    submitted: string | null;
    created: string | null;
    last_updated: string | null;
  };
  services: Array<{
    id: string;
    service_code: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_upcoded: boolean;
  }>;
}

interface ApiPaginatedClaims {
  items: ApiClaimListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ─── Status mappers ───────────────────────────────────────────────────────────

// Backend ClaimStatus enum → frontend ClaimStatus
// Fix 1: UNDER_REVIEW (not UNDER_INVESTIGATION)
function mapStatus(s: string): Claim['status'] {
  const map: Record<string, Claim['status']> = {
    SUBMITTED: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged',
    UNDER_REVIEW: 'under_review', // ← was UNDER_INVESTIGATION
    PAID: 'paid',
  };
  return map[s.toUpperCase()] ?? 'pending';
}

// Frontend ClaimStatus → backend enum string for PATCH /status
// Fix 9: used when sending status filter or status update
function toBackendStatus(s: ClaimStatus): string {
  const map: Record<ClaimStatus, string> = {
    pending: 'SUBMITTED',
    approved: 'APPROVED',
    rejected: 'REJECTED',
    flagged: 'FLAGGED',
    under_review: 'UNDER_REVIEW',
    paid: 'PAID',
  };
  return map[s];
}

// Map list item → Claim
function mapListItem(a: ApiClaimListItem): Claim {
  const status = mapStatus(a.status);
  const riskLevel = (a.risk_level?.toLowerCase() ??
    'low') as Claim['riskLevel'];
  return {
    id: a.id,
    claimNumber: a.sha_claim_id,
    providerId: a.provider_id_code ?? '',
    providerName: a.provider_name ?? '',
    patientId: a.member_sha_id_masked ?? '',
    amount: a.total_claim_amount ?? 0,
    claimAmount: a.total_claim_amount ?? 0,
    serviceDateStart: a.service_date ? new Date(a.service_date) : new Date(),
    serviceDateEnd: a.service_date ? new Date(a.service_date) : new Date(),
    diagnosis: '',
    procedure: '',
    status,
    riskScore: a.risk_score ?? 0,
    riskLevel,
    fraudFlags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    submittedAt: new Date(),
    countyCode: 'N/A',
    countyName: 'Unknown',
    facilityType: 'unknown',
  };
}

// Map full detail → Claim
function mapDetail(a: ApiClaimDetail): Claim {
  const status = mapStatus(a.status);
  const riskLevel = (a.risk_level?.toLowerCase() ??
    'low') as Claim['riskLevel'];
  const info = a.claim_information;
  const upcoded = a.services.filter(s => s.is_upcoded);
  const now = new Date();
  return {
    id: a.id,
    claimNumber: a.sha_claim_id,
    providerId: info.provider_id,
    providerName: a.provider_name ?? info.provider_name ?? '',
    patientId: info.patient_id_masked,
    amount: a.claim_amount ?? 0,
    claimAmount: a.claim_amount ?? 0,
    approvedAmount:
      status === 'approved' ? (a.claim_amount ?? undefined) : undefined,
    rejectedAmount:
      status === 'rejected' ? (a.claim_amount ?? undefined) : undefined,
    serviceDateStart: info.service_date_start
      ? new Date(info.service_date_start)
      : now,
    serviceDateEnd: info.service_date_end
      ? new Date(info.service_date_end)
      : now,
    diagnosis: info.diagnosis_codes.join(', '),
    procedure: a.services.map(s => s.description ?? s.service_code).join(', '),
    status,
    riskScore: a.risk_score ?? 0,
    riskLevel,
    fraudFlags: upcoded.map(s => ({
      id: s.id,
      type: 'upcoding' as const,
      severity: 'high' as const,
      description: `Service ${s.service_code} flagged as upcoded`,
      timestamp: new Date(a.details.last_updated ?? a.details.created ?? now),
    })),
    createdAt: new Date(a.details.created ?? now),
    updatedAt: new Date(a.details.last_updated ?? a.details.created ?? now),
    submittedAt: new Date(a.details.submitted ?? a.details.created ?? now),
    countyCode: info.county?.substring(0, 3).toUpperCase() ?? 'N/A',
    countyName: info.county ?? 'Unknown',
    facilityType:
      info.facility_type ?? a.claim_type?.toLowerCase() ?? 'unknown',
    availableActions: a.available_actions as Claim['availableActions'],
  };
}

// Map fraud_analysis from detail → ClaimAnalysis
function mapAnalysis(raw: ApiClaimDetail['fraud_analysis']): ClaimAnalysis {
  return {
    overallScore: raw.overall_score,
    riskLevel: (raw.risk_level?.toLowerCase() ??
      null) as ClaimAnalysis['riskLevel'],
    phantomPatient: {
      detected: raw.phantom_patient.detected,
      iprsStatus: raw.phantom_patient.iprs_status,
      geographicAnomaly: raw.phantom_patient.geographic_anomaly,
      visitFrequencyAnomaly: raw.phantom_patient.visit_frequency_anomaly,
      confidence: raw.phantom_patient.confidence,
    },
    duplicateClaim: {
      detected: raw.duplicate_claim.detected,
      duplicateCount: raw.duplicate_claim.duplicate_count,
      duplicateClaimIds: raw.duplicate_claim.duplicate_claim_ids,
      sameProvider: raw.duplicate_claim.same_provider,
      windowDays: raw.duplicate_claim.window_days,
      confidence: raw.duplicate_claim.confidence,
    },
    upcoding: {
      detected: raw.upcoding.detected,
      flaggedServiceCodes: raw.upcoding.flagged_service_codes,
      flagReasons: raw.upcoding.flag_reasons,
      confidence: raw.upcoding.confidence,
    },
    providerAnomaly: {
      detected: raw.provider_anomaly.detected,
      providerVsPeerRatio: raw.provider_anomaly.provider_vs_peer_ratio,
      highRiskFlag: raw.provider_anomaly.high_risk_flag,
      confidence: raw.provider_anomaly.confidence,
    },
    topFlags: raw.top_flags,
    ruleScore: raw.rule_score,
    mlScore: raw.ml_score,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const claimsService = {
  // GET /api/v1/claims
  // Fix 8: removed unsupported date_from/date_to — list route only accepts
  //        search, status, risk_level, county, page, page_size
  // Fix 9: param name is "status" not "sha_status"
  getClaims: async (
    filters: ClaimFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<Claim>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', toBackendStatus(filters.status)); // ← was sha_status
    if (filters.riskLevel)
      params.set('risk_level', filters.riskLevel.toUpperCase());
    if (filters.county) params.set('county', filters.county);
    // dateFrom/dateTo not supported by list endpoint — omitted
    const response = await api.get<ApiPaginatedClaims>(`/claims?${params}`);
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

  // GET /api/v1/claims/{id} — returns ClaimDetailResponse (not list item shape)
  // Fix 6: was using ApiClaim (list shape) — now uses ApiClaimDetail
  getClaimById: async (id: string): Promise<Claim> => {
    const detail = await api.get<ApiClaimDetail>(`/claims/${id}`);
    return mapDetail(detail);
  },

  // GET /api/v1/claims/{id} — fraud_analysis is nested in ClaimDetailResponse
  // Fix 7: was calling non-existent /claims/{id}/analysis endpoint
  getClaimAnalysis: async (claimId: string): Promise<ClaimAnalysis> => {
    const detail = await api.get<ApiClaimDetail>(`/claims/${claimId}`);
    return mapAnalysis(detail.fraud_analysis);
  },

  // PATCH /api/v1/claims/{id}/status — body: { sha_status, note? }
  // Fix 4: was POST /claims/{id}/approve — endpoint doesn't exist
  approveClaim: async (claimId: string, notes?: string): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      {
        sha_status: 'APPROVED',
        note: notes,
      },
    );
    return mapDetail(detail);
  },

  // Fix 4: was POST /claims/{id}/reject — endpoint doesn't exist
  rejectClaim: async (claimId: string, reason: string): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      {
        sha_status: 'REJECTED',
        note: reason,
      },
    );
    return mapDetail(detail);
  },

  // Fix 4: was POST /claims/{id}/flag — endpoint doesn't exist
  flagForInvestigation: async (
    claimId: string,
    investigationType: string,
  ): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      {
        sha_status: 'FLAGGED',
        note: investigationType,
      },
    );
    return mapDetail(detail);
  },

  // Fix 5: was POST /claims/{id}/assign — endpoint doesn't exist.
  // Assignment is done via FraudCase. Flow: mark UNDER_REVIEW → create investigation case.
  assignInvestigator: async (
    claimId: string,
    investigatorId: string,
    _investigatorName: string,
  ): Promise<Claim> => {
    await api.patch<ApiClaimDetail>(`/claims/${claimId}/status`, {
      sha_status: 'UNDER_REVIEW',
    });
    await api.post(`/investigations`, {
      claim_id: claimId,
      assigned_to: investigatorId,
    });
    const detail = await api.get<ApiClaimDetail>(`/claims/${claimId}`);
    return mapDetail(detail);
  },

  exportClaims: async (format: 'csv' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get(`/claims/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  uploadClaims: async (file: File): Promise<{ imported: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ imported: number }>(
      `/claims/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
