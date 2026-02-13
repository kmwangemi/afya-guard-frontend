import { Claim, ClaimFilterParams, ClaimAnalysis } from "@/types/claim";
import { PaginatedResponse } from "@/types/common";

const generateMockClaims = (count: number): Claim[] => {
  const claims: Claim[] = [];
  const providers = [
    { id: "prov_001", name: "Kenyatta National Hospital" },
    { id: "prov_002", name: "MP Shah Medical Centre" },
    { id: "prov_003", name: "Nairobi Hospital" },
    { id: "prov_004", name: "The Aga Khan Hospital" },
    { id: "prov_005", name: "Coptic Hospital" },
  ];

  const riskLevels = ["low", "medium", "high", "critical"] as const;
  const statuses = ["pending", "approved", "rejected", "flagged", "under_investigation"] as const;
  const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri"];

  for (let i = 1; i <= count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const county = counties[Math.floor(Math.random() * counties.length)];

    claims.push({
      id: `claim_${String(i).padStart(6, "0")}`,
      claimNumber: `CLM-2024-${String(i).padStart(6, "0")}`,
      providerId: provider.id,
      providerName: provider.name,
      patientId: `PAT-${String(Math.random() * 1000000).padStart(8, "0")}`,
      amount: Math.floor(Math.random() * 500000) + 5000,
      serviceDateStart: new Date(2024, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1),
      serviceDateEnd: new Date(2024, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1),
      diagnosis: "Hypertension, Type 2 Diabetes, Acute Respiratory Infection",
      procedure: "Consultation, Blood Test, X-Ray",
      status,
      riskScore: Math.floor(Math.random() * 100),
      riskLevel,
      fraudFlags: riskLevel === "critical" || riskLevel === "high" ? [
        {
          id: "flag_1",
          type: "phantom_patient",
          severity: "high",
          description: "Patient address does not match IPRS records",
          timestamp: new Date(),
        },
        {
          id: "flag_2",
          type: "upcoding",
          severity: "medium",
          description: "Procedure code inconsistent with diagnosis",
          timestamp: new Date(),
        },
      ] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      submittedAt: new Date(2024, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1),
      countyCode: county.substring(0, 3).toUpperCase(),
      countyName: county,
      facilityType: "hospital",
      claimAmount: Math.floor(Math.random() * 500000) + 5000,
      approvedAmount: status === "approved" ? Math.floor(Math.random() * 400000) + 3000 : undefined,
      rejectedAmount: status === "rejected" ? Math.floor(Math.random() * 200000) + 1000 : undefined,
      notes: riskLevel === "critical" ? "High-risk claim, recommend immediate investigation" : undefined,
    });
  }

  return claims;
};

export const mockClaimsService = {
  getClaims: async (
    filters?: ClaimFilterParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<PaginatedResponse<Claim>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const allClaims = generateMockClaims(1000);
    let filtered = allClaims;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.claimNumber.toLowerCase().includes(search) ||
          c.providerName.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter((c) => c.status === filters.status);
    }

    if (filters?.riskLevel) {
      filtered = filtered.filter((c) => c.riskLevel === filters.riskLevel);
    }

    if (filters?.county) {
      filtered = filtered.filter((c) => c.countyName === filters.county);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  },

  getClaimById: async (id: string): Promise<Claim> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const claims = generateMockClaims(100);
    const claim = claims.find((c) => c.id === id);
    if (!claim) throw new Error("Claim not found");
    return claim;
  },

  getClaimAnalysis: async (claimId: string): Promise<ClaimAnalysis> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      phantomPatient: {
        iprsFlag: Math.random() > 0.5,
        geographicAnomaly: Math.random() > 0.5,
        visitFrequencyAnomaly: Math.random() > 0.5,
        iprsStatus: "VERIFIED",
        evidence: [
          "Patient address mismatch with IPRS",
          "Unusual visit frequency pattern",
        ],
      },
      upcoding: {
        detected: Math.random() > 0.6,
        confidence: Math.random() * 100,
        diagnosisProcedureMatch: Math.random() > 0.4,
        mlDetectionScore: Math.random() * 100,
        statisticalOutlier: Math.random() > 0.5,
        evidence: [
          "Procedure code higher than diagnosis suggests",
          "Cost deviation from similar claims",
        ],
      },
      duplicateDetection: {
        exactMatches: Math.floor(Math.random() * 5),
        fuzzyMatches: Math.floor(Math.random() * 10),
        relatedClaims: [
          "CLM-2024-000001",
          "CLM-2024-000002",
        ],
      },
    };
  },

  exportClaims: async (format: "csv" | "excel"): Promise<Blob> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return new Blob(["mock data"], { type: "text/plain" });
  },
};
