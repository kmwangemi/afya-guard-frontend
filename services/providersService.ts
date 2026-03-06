import { api } from '@/lib/api';
import { PaginatedResponse } from '@/types/common';
import {
  FacilityType,
  ProviderCreateParams,
  ProviderDetail,
  ProviderFilterParams,
  ProviderListItem,
  RiskLevel,
} from '@/types/provider';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface ApiProviderListItem {
  id: string;
  sha_provider_code: string;
  name: string;
  facility_type: string | null;
  county: string | null;
  total_claims: number;
  flagged_percentage: number;
  risk_score: number | null;
  risk_level: string | null;
  accreditation_status: string | null;
  high_risk_flag: boolean;
}

interface ApiProviderDetail {
  id: string;
  sha_provider_code: string;
  name: string;
  header: {
    risk_score: number | null;
    risk_level: string | null;
    total_claims: number;
    flagged_claims_percentage: number;
    confirmed_fraud_count: number;
  };
  provider_information: {
    facility_type: string | null;
    county: string | null;
    phone: string | null;
    email: string | null;
    bed_capacity: number | null;
    status: string | null;
  };
  risk_profile: {
    claim_deviation: { label: string; value: number; colour: string };
    rejection_rate: { label: string; value: number; colour: string };
    fraud_history_score: { label: string; value: number; colour: string };
  };
  statistics: {
    total_amount: number;
    average_claim: number;
    rejection_rate: number;
    avg_processing_time_days: number;
  };
  quick_stats: {
    total_claims: number;
    flagged: number;
    confirmed_fraud: number;
    last_claim_date: string | null;
  };
  fraud_history: {
    confirmed_cases: number;
    suspected_cases: number;
    total_fraud_amount: number;
  };
  sub_county: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ApiProviderResponse {
  id: string;
  sha_provider_code: string;
  name: string;
  county: string | null;
  facility_type: string | null;
  accreditation_status: string | null;
  high_risk_flag: boolean;
}

interface ApiPaginatedProviders {
  items: ApiProviderListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapListItem(a: ApiProviderListItem): ProviderListItem {
  return {
    id: a.id,
    shaProviderCode: a.sha_provider_code,
    name: a.name,
    facilityType: (a.facility_type as FacilityType) ?? null,
    county: a.county,
    totalClaims: a.total_claims,
    flaggedPercentage: a.flagged_percentage,
    riskScore: a.risk_score,
    riskLevel: (a.risk_level?.toLowerCase() as RiskLevel) ?? null,
    accreditationStatus:
      a.accreditation_status as ProviderListItem['accreditationStatus'],
    highRiskFlag: a.high_risk_flag,
  };
}

function mapDetail(a: ApiProviderDetail): ProviderDetail {
  return {
    id: a.id,
    shaProviderCode: a.sha_provider_code,
    name: a.name,
    header: {
      riskScore: a.header.risk_score,
      riskLevel: (a.header.risk_level?.toLowerCase() as RiskLevel) ?? null,
      totalClaims: a.header.total_claims,
      flaggedClaimsPercentage: a.header.flagged_claims_percentage,
      confirmedFraudCount: a.header.confirmed_fraud_count,
    },
    providerInformation: {
      facilityType:
        (a.provider_information.facility_type as FacilityType) ?? null,
      county: a.provider_information.county,
      phone: a.provider_information.phone,
      email: a.provider_information.email,
      bedCapacity: a.provider_information.bed_capacity,
      status: a.provider_information
        .status as ProviderDetail['providerInformation']['status'],
    },
    riskProfile: {
      claimDeviation: a.risk_profile.claim_deviation,
      rejectionRate: a.risk_profile.rejection_rate,
      fraudHistoryScore: a.risk_profile.fraud_history_score,
    },
    statistics: {
      totalAmount: a.statistics.total_amount,
      averageClaim: a.statistics.average_claim,
      rejectionRate: a.statistics.rejection_rate,
      avgProcessingTimeDays: a.statistics.avg_processing_time_days,
    },
    quickStats: {
      totalClaims: a.quick_stats.total_claims,
      flagged: a.quick_stats.flagged,
      confirmedFraud: a.quick_stats.confirmed_fraud,
      lastClaimDate: a.quick_stats.last_claim_date,
    },
    fraudHistory: {
      confirmedCases: a.fraud_history.confirmed_cases,
      suspectedCases: a.fraud_history.suspected_cases,
      totalFraudAmount: a.fraud_history.total_fraud_amount,
    },
    subCounty: a.sub_county,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const providersService = {
  // GET /api/v1/providers
  // Fix 11: facilityType sent UPPERCASE to match backend FacilityType enum
  getProviders: async (
    filters?: ProviderFilterParams,
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<ProviderListItem>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters?.search) params.set('search', filters.search);
    if (filters?.county) params.set('county', filters.county);
    if (filters?.facilityType)
      params.set('facility_type', filters.facilityType); // already UPPERCASE
    if (filters?.riskLevel)
      params.set('risk_level', filters.riskLevel.toUpperCase());
    const response = await api.get<ApiPaginatedProviders>(
      `/providers?${params}`,
    );
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
  // GET /api/v1/providers/{id} — returns ProviderDetailResponse (nested)
  // Fix 6: was returning flat Provider from mock; now maps full ProviderDetailResponse
  getProviderById: async (id: string): Promise<ProviderDetail> => {
    const detail = await api.get<ApiProviderDetail>(`/providers/${id}`);
    return mapDetail(detail);
  },
  // Fix 7: no /providers/{id}/claims endpoint — use GET /claims?provider_id=
  getProviderClaims: async (
    providerId: string,
    page: number = 1,
    pageSize: number = 25,
  ) => {
    const params = new URLSearchParams();
    params.set('provider_id', providerId);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    return api.get(`/claims?${params}`);
  },
  // Fix 9: no /providers/suspend endpoint — PATCH /providers/{id} with accreditation_status
  suspendProvider: async (
    providerId: string,
    reason: string,
  ): Promise<ProviderDetail> => {
    await api.patch<ApiProviderResponse>(`/providers/${providerId}`, {
      accreditation_status: 'SUSPENDED',
      // reason stored as a note — backend ProviderUpdate doesn't have a notes field,
      // so log it client-side; the status change is the meaningful action
    });
    console.info(`[providers] suspended ${providerId}: ${reason}`);
    const detail = await api.get<ApiProviderDetail>(`/providers/${providerId}`);
    return mapDetail(detail);
  },
  // Fix 9: no /providers/flag endpoint — PATCH /providers/{id} with high_risk_flag: true
  flagForReview: async (
    providerId: string,
    reason: string,
  ): Promise<ProviderDetail> => {
    await api.patch<ApiProviderResponse>(`/providers/${providerId}`, {
      high_risk_flag: true,
    });
    console.info(`[providers] flagged ${providerId}: ${reason}`);
    const detail = await api.get<ApiProviderDetail>(`/providers/${providerId}`);
    return mapDetail(detail);
  },
  // POST /api/v1/providers
  // Fix 10: sha_provider_code is required by backend ProviderCreate schema
  addProvider: async (
    data: ProviderCreateParams,
  ): Promise<ApiProviderResponse> => {
    return api.post<ApiProviderResponse>('/providers', {
      sha_provider_code: data.shaProviderCode,
      name: data.name,
      county: data.county,
      facility_type: data.facilityType,
      phone: data.phone,
      email: data.email,
      bed_capacity: data.bedCapacity,
    });
  },
  // PATCH /api/v1/providers/{id}
  updateProvider: async (
    providerId: string,
    data: Partial<ProviderCreateParams>,
  ): Promise<ApiProviderResponse> => {
    return api.patch<ApiProviderResponse>(`/providers/${providerId}`, {
      name: data.name,
      county: data.county,
      facility_type: data.facilityType,
      phone: data.phone,
      email: data.email,
      bed_capacity: data.bedCapacity,
    });
  },
};
