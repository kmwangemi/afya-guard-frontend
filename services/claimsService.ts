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
  status: ClaimStatus;
}

// GET /claims/{id} — full detail (ClaimDetailResponse)
interface ApiClaimDetail {
  id: string;
  sha_claim_id: string;
  provider_name: string | null;
  status: ClaimStatus;
  risk_score: number | null;
  risk_level: string | null;
  claim_amount: number | null;
  service_date: string | null;
  claim_type: string | null;
  available_actions: string[];
  claim_information: {
    patient_id_masked: string;
    // FIX [WRONG-1]: was provider_id — backend field is provider_id_code
    provider_id_code: string | null;
    provider_name: string | null;
    county: string | null;
    // FIX [MINOR-1]: added diagnosis — backend provides pre-joined ICD string
    diagnosis: string | null;
    diagnosis_codes: string[];
    // FIX [WRONG-1]: was service_date_start/end — backend fields are _from/_to
    service_date_from: string | null;
    service_date_to: string | null;
    // FIX [WRONG-1]: removed facility_type — does NOT exist in ClaimInformation schema
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
    detector_scores: Record<string, number> | null;
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

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapListItem(a: ApiClaimListItem): Claim {
  const riskLevel = (a.risk_level ?? 'LOW') as Claim['riskLevel'];
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
    status: a.status,
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

function mapDetail(a: ApiClaimDetail): Claim {
  const status = a.status;
  const riskLevel = (a.risk_level ?? 'LOW') as Claim['riskLevel'];
  const info = a.claim_information;
  const upcoded = a.services.filter(s => s.is_upcoded);
  const now = new Date();
  return {
    id: a.id,
    claimNumber: a.sha_claim_id,
    providerId: info.provider_id_code ?? '',
    providerName: a.provider_name ?? info.provider_name ?? '',
    patientId: info.patient_id_masked,
    amount: a.claim_amount ?? 0,
    claimAmount: a.claim_amount ?? 0,
    approvedAmount:
      status === 'APPROVED' ? (a.claim_amount ?? undefined) : undefined,
    rejectedAmount:
      status === 'REJECTED' ? (a.claim_amount ?? undefined) : undefined,
    serviceDateStart: info.service_date_from
      ? new Date(info.service_date_from)
      : now,
    serviceDateEnd: info.service_date_to ? new Date(info.service_date_to) : now,
    diagnosis: info.diagnosis ?? info.diagnosis_codes.join(', '),
    procedure: a.services.map(s => s.description ?? s.service_code).join(', '),
    status,
    riskScore: a.risk_score ?? 0,
    riskLevel,
    fraudFlags: upcoded.map(s => ({
      id: s.id,
      type: 'UPCODING',
      severity: 'HIGH' as const,
      description: `Service ${s.service_code} flagged as upcoded`,
      timestamp:
        a.details.last_updated || a.details.created
          ? new Date(a.details.last_updated ?? a.details.created!)
          : now,
    })),
    createdAt: a.details.created ? new Date(a.details.created) : now,
    updatedAt: a.details.last_updated ? new Date(a.details.last_updated) : now,
    submittedAt: a.details.submitted ? new Date(a.details.submitted) : now,
    countyCode: info.county?.substring(0, 3).toUpperCase() ?? 'N/A',
    countyName: info.county ?? 'Unknown',
    facilityType: a.claim_type?.toLowerCase() ?? 'unknown',
    availableActions: a.available_actions as Claim['availableActions'],
  };
}

function mapAnalysis(raw: ApiClaimDetail['fraud_analysis']): ClaimAnalysis {
  return {
    overallScore: raw.overall_score,
    riskLevel: (raw.risk_level ?? null) as ClaimAnalysis['riskLevel'],
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
    detectorScores: raw.detector_scores,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const claimsService = {
  // GET /api/v1/claims
  getClaims: async (
    filters: ClaimFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<Claim>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.riskLevel) params.set('risk_level', filters.riskLevel);
    if (filters.county) params.set('county', filters.county);
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
  getClaimById: async (id: string): Promise<Claim> => {
    const detail = await api.get<ApiClaimDetail>(`/claims/${id}`);
    return mapDetail(detail);
  },
  getClaimAnalysis: async (claimId: string): Promise<ClaimAnalysis> => {
    const detail = await api.get<ApiClaimDetail>(`/claims/${claimId}`);
    return mapAnalysis(detail.fraud_analysis);
  },
  approveClaim: async (claimId: string, notes?: string): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      { sha_status: 'APPROVED', note: notes },
    );
    return mapDetail(detail);
  },
  rejectClaim: async (claimId: string, reason: string): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      { sha_status: 'REJECTED', note: reason },
    );
    return mapDetail(detail);
  },
  flagForInvestigation: async (
    claimId: string,
    investigationType: string,
  ): Promise<Claim> => {
    const detail = await api.patch<ApiClaimDetail>(
      `/claims/${claimId}/status`,
      { sha_status: 'FLAGGED', note: investigationType },
    );
    return mapDetail(detail);
  },
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
