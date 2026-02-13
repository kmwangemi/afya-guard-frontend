import { Provider, ProviderFilterParams } from "@/types/provider";
import { PaginatedResponse } from "@/types/common";

const generateMockProviders = (count: number): Provider[] => {
  const providers: Provider[] = [];
  const names = [
    "Kenyatta National Hospital",
    "MP Shah Medical Centre",
    "Nairobi Hospital",
    "The Aga Khan Hospital",
    "Coptic Hospital",
    "Karen Hospital",
    "City Medical Centre",
    "Westlands Medical",
    "Parklands Clinic",
    "Upper Hill Diagnostic",
  ];

  const counties = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Nyeri", "Kiambu"];
  const facilityTypes = ["hospital", "clinic", "diagnostic", "laboratory", "pharmacy"] as const;
  const riskLevels = ["low", "medium", "high", "critical"] as const;

  for (let i = 1; i <= count; i++) {
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const riskScore = riskLevel === "critical" ? 75 + Math.random() * 25 :
                      riskLevel === "high" ? 50 + Math.random() * 25 :
                      riskLevel === "medium" ? 25 + Math.random() * 25 :
                      Math.random() * 25;

    providers.push({
      id: `prov_${String(i).padStart(6, "0")}`,
      code: `NHF-${String(i).padStart(5, "0")}`,
      name: names[i % names.length] + (i > names.length ? ` ${Math.ceil(i / names.length)}` : ""),
      facilityType: facilityTypes[i % facilityTypes.length],
      countyCode: counties[i % counties.length].substring(0, 3).toUpperCase(),
      countyName: counties[i % counties.length],
      subcounty: "Main subcounty",
      location: "123 Health Street",
      contact: "+254712345678",
      email: `info@provider${i}.ke`,
      phone: "+254712345678",
      bedCapacity: Math.floor(Math.random() * 500) + 50,
      accreditationStatus: ["active", "suspended", "revoked", "pending"][Math.floor(Math.random() * 4)] as any,
      accreditationNumber: `ACC-${String(i).padStart(6, "0")}`,
      active: Math.random() > 0.1,
      riskScore: Math.floor(riskScore),
      riskLevel: riskLevel,
      riskProfile: {
        claimDeviation: Math.random() * 100,
        rejectionRate: Math.random() * 0.5,
        procedureDiversity: Math.random() * 100,
        volumeAnomaly: Math.random() * 100,
        fraudHistory: Math.random() * 100,
        overall: Math.floor(riskScore),
      },
      statistics: {
        totalClaims: Math.floor(Math.random() * 10000) + 100,
        totalAmount: Math.floor(Math.random() * 500000000) + 1000000,
        averageAmount: Math.floor(Math.random() * 500000) + 10000,
        flaggedClaims: Math.floor(Math.random() * 500) + 10,
        flaggedPercentage: Math.random() * 0.15,
        confirmedFraud: Math.floor(Math.random() * 50),
        rejectionRate: Math.random() * 0.3,
        averageProcessingTime: Math.floor(Math.random() * 30) + 5,
      },
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(),
      lastClaimDate: new Date(Date.now() - Math.random() * 86400000 * 30),
      fraudHistory: {
        confirmedCases: Math.floor(Math.random() * 5),
        suspectedCases: Math.floor(Math.random() * 10),
        totalAmount: Math.floor(Math.random() * 10000000),
        lastInvestigation: new Date(Date.now() - Math.random() * 86400000 * 180),
      },
    });
  }

  return providers;
};

export const mockProvidersService = {
  getProviders: async (
    filters?: ProviderFilterParams,
    page: number = 1,
    pageSize: number = 25
  ): Promise<PaginatedResponse<Provider>> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const allProviders = generateMockProviders(500);
    let filtered = allProviders;

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.code.toLowerCase().includes(search)
      );
    }

    if (filters?.county) {
      filtered = filtered.filter((p) => p.countyName === filters.county);
    }

    if (filters?.facilityType) {
      filtered = filtered.filter((p) => p.facilityType === filters.facilityType);
    }

    if (filters?.riskLevel) {
      filtered = filtered.filter((p) => p.riskLevel === filters.riskLevel);
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

  getProviderById: async (id: string): Promise<Provider> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const providers = generateMockProviders(100);
    const provider = providers.find((p) => p.id === id);
    if (!provider) throw new Error("Provider not found");
    return provider;
  },

  getProviderClaims: async (
    providerId: string,
    page: number = 1,
    pageSize: number = 50
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  },

  getProviderStatistics: async (providerId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      monthlyTrend: [],
      riskBreakdown: [],
      performanceMetrics: {},
    };
  },
};
