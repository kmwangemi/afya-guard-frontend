import { api, apiClient } from '@/lib/api';
import { Claim, ClaimAnalysis, ClaimFilterParams } from '@/types/claim';
import { PaginatedResponse } from '@/types/common';

// ─── API Response Types (matching FastAPI schema) ────────────────────────────

interface ApiProvider {
  id: string;
  sha_provider_code: string;
  name: string;
  county: string | null;
  facility_type: string | null;
  accreditation_status: string;
  high_risk_flag: boolean;
}

interface ApiMember {
  id: string;
  sha_member_id: string;
  gender: string | null;
  county: string | null;
  coverage_status: string | null;
}

interface ApiService {
  id: string;
  service_code: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_upcoded: boolean;
}

interface ApiClaim {
  id: string;
  sha_claim_id: string;
  claim_type: 'INPATIENT' | 'OUTPATIENT';
  sha_status: string;
  admission_date: string | null;
  discharge_date: string | null;
  diagnosis_codes: string[];
  total_claim_amount: number;
  approved_amount: number;
  submitted_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string | null;
  provider: ApiProvider;
  member: ApiMember;
  services: ApiService[];
}

interface ApiPaginatedResponse {
  items: ApiClaim[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function deriveRiskLevel(
  claim: ApiClaim,
): 'low' | 'medium' | 'high' | 'critical' {
  const hasUpcodedServices = claim.services.some(s => s.is_upcoded);
  const isHighRiskProvider = claim.provider.high_risk_flag;
  const isLargeAmount = claim.total_claim_amount > 200000;
  if (isHighRiskProvider && hasUpcodedServices) return 'critical';
  if (isHighRiskProvider || (hasUpcodedServices && isLargeAmount))
    return 'high';
  if (hasUpcodedServices || isLargeAmount) return 'medium';
  return 'low';
}

function deriveStatus(
  shaStatus: string,
): 'pending' | 'approved' | 'rejected' | 'flagged' | 'under_investigation' {
  const map: Record<
    string,
    'pending' | 'approved' | 'rejected' | 'flagged' | 'under_investigation'
  > = {
    SUBMITTED: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FLAGGED: 'flagged',
    UNDER_INVESTIGATION: 'under_investigation',
    PROCESSING: 'pending',
  };
  return map[shaStatus.toUpperCase()] ?? 'pending';
}

function mapApiClaimToClaim(apiClaim: ApiClaim): Claim {
  const riskLevel = deriveRiskLevel(apiClaim);
  const status = deriveStatus(apiClaim.sha_status);
  const upcodedServices = apiClaim.services.filter(s => s.is_upcoded);

  return {
    id: apiClaim.id,
    claimNumber: apiClaim.sha_claim_id,
    providerId: apiClaim.provider.id,
    providerName: apiClaim.provider.name,
    patientId: apiClaim.member.sha_member_id,
    amount: apiClaim.total_claim_amount,
    claimAmount: apiClaim.total_claim_amount,
    approvedAmount:
      apiClaim.approved_amount > 0 ? apiClaim.approved_amount : undefined,
    rejectedAmount:
      status === 'rejected' ? apiClaim.total_claim_amount : undefined,
    serviceDateStart: apiClaim.admission_date
      ? new Date(apiClaim.admission_date)
      : new Date(apiClaim.created_at),
    serviceDateEnd: apiClaim.discharge_date
      ? new Date(apiClaim.discharge_date)
      : new Date(apiClaim.created_at),
    diagnosis: apiClaim.diagnosis_codes.join(', '),
    procedure: apiClaim.services
      .map(s => s.description ?? s.service_code)
      .join(', '),
    status,
    riskScore:
      riskLevel === 'critical'
        ? 90
        : riskLevel === 'high'
          ? 70
          : riskLevel === 'medium'
            ? 40
            : 15,
    riskLevel,
    fraudFlags: upcodedServices.map(s => ({
      id: s.id,
      type: 'upcoding' as const,
      severity: 'high' as const,
      description: `Service ${s.service_code} flagged as upcoded`,
      timestamp: new Date(apiClaim.updated_at ?? apiClaim.created_at),
    })),
    createdAt: new Date(apiClaim.created_at),
    updatedAt: new Date(apiClaim.updated_at ?? apiClaim.created_at),
    submittedAt: new Date(apiClaim.submitted_at),
    countyCode:
      apiClaim.provider.county?.substring(0, 3).toUpperCase() ?? 'N/A',
    countyName: apiClaim.provider.county ?? apiClaim.member.county ?? 'Unknown',
    facilityType:
      apiClaim.provider.facility_type ?? apiClaim.claim_type.toLowerCase(),
    notes: apiClaim.provider.high_risk_flag
      ? 'Provider flagged as high risk'
      : undefined,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const claimsService = {
  /**
   * Fetch paginated claims with optional filters.
   */
  getClaims: async (
    filters: ClaimFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<Claim>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('sha_status', filters.status.toUpperCase());
    if (filters.riskLevel) params.set('risk_level', filters.riskLevel);
    if (filters.county) params.set('county', filters.county);
    if (filters.dateFrom) params.set('date_from', filters.dateFrom);
    if (filters.dateTo) params.set('date_to', filters.dateTo);
    const response = await api.get<ApiPaginatedResponse>(`/claims?${params}`);
    return {
      data: response.items.map(mapApiClaimToClaim),
      pagination: {
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.pages,
        hasMore: response.page < response.pages,
      },
    };
  },

  /**
   * Fetch a single claim by its internal UUID.
   */
  getClaimById: async (id: string): Promise<Claim> => {
    const apiClaim = await api.get<ApiClaim>(`/claims/${id}`);
    return mapApiClaimToClaim(apiClaim);
  },

  /**
   * Fetch AI fraud analysis for a specific claim.
   */
  getClaimAnalysis: async (claimId: string): Promise<ClaimAnalysis> => {
    return api.get<ClaimAnalysis>(`/claims/${claimId}/analysis`);
  },

  /**
   * Export claims as CSV or Excel.
   * Uses apiClient directly to get the raw Blob response (auth headers included).
   */
  exportClaims: async (format: 'csv' | 'excel'): Promise<Blob> => {
    const response = await apiClient.get(`/claims/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Approve a claim.
   */
  approveClaim: async (claimId: string, notes?: string): Promise<Claim> => {
    const apiClaim = await api.post<ApiClaim>(`/claims/${claimId}/approve`, {
      notes,
    });
    return mapApiClaimToClaim(apiClaim);
  },

  /**
   * Reject a claim with a reason.
   */
  rejectClaim: async (claimId: string, reason: string): Promise<Claim> => {
    const apiClaim = await api.post<ApiClaim>(`/claims/${claimId}/reject`, {
      reason,
    });
    return mapApiClaimToClaim(apiClaim);
  },

  /**
   * Flag a claim for investigation.
   */
  flagForInvestigation: async (
    claimId: string,
    investigationType: string,
  ): Promise<Claim> => {
    const apiClaim = await api.post<ApiClaim>(`/claims/${claimId}/flag`, {
      investigation_type: investigationType,
    });
    return mapApiClaimToClaim(apiClaim);
  },

  /**
   * Assign a claim to an investigator.
   */
  assignInvestigator: async (
    claimId: string,
    investigatorId: string,
    investigatorName: string,
  ): Promise<Claim> => {
    const apiClaim = await api.post<ApiClaim>(`/claims/${claimId}/assign`, {
      investigator_id: investigatorId,
      investigator_name: investigatorName,
    });
    return mapApiClaimToClaim(apiClaim);
  },

  /**
   * Upload a claims file (CSV / Excel).
   * Uses apiClient directly to send multipart/form-data with auth headers.
   */
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
