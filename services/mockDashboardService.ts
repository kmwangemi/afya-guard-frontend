import { DashboardStats, TrendData, CountyFraudData } from "@/types/common";
import { Alert } from "@/types/alert";

export const mockDashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      totalClaimsProcessed: 124567,
      flaggedClaims: 3245,
      criticalAlerts: 89,
      estimatedFraudPrevented: 245680000,
    };
  },

  getTrendData: async (days: number = 30): Promise<TrendData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data: TrendData[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split("T")[0],
        totalClaims: Math.floor(Math.random() * 2000) + 3000,
        flaggedClaims: Math.floor(Math.random() * 150) + 50,
        fraudRate: Math.random() * 0.1,
      });
    }

    return data;
  },

  getCountyFraudData: async (): Promise<CountyFraudData[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const counties = [
      "Nairobi",
      "Mombasa",
      "Kisumu",
      "Nakuru",
      "Nyeri",
      "Kiambu",
      "Muranga",
      "Kakamega",
    ];

    return counties.map((county) => ({
      county,
      totalClaims: Math.floor(Math.random() * 8000) + 2000,
      flaggedClaims: Math.floor(Math.random() * 400) + 50,
      fraudRate: Math.random() * 0.15,
      estimatedAmount: Math.floor(Math.random() * 50000000) + 5000000,
    }));
  },

  getCriticalAlerts: async (limit: number = 10): Promise<Alert[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const alerts: Alert[] = [];
    const types = [
      "high_risk_claim",
      "phantom_patient",
      "upcoding",
      "duplicate_claim",
      "provider_anomaly",
    ];

    for (let i = 0; i < limit; i++) {
      alerts.push({
        id: `alert_${String(i + 1).padStart(5, "0")}`,
        alertNumber: `ALT-2024-${String(i + 1).padStart(6, "0")}`,
        claimId: `claim_${String(i + 1).padStart(6, "0")}`,
        claimNumber: `CLM-2024-${String(i + 1).padStart(6, "0")}`,
        providerId: `prov_00${(i % 5) + 1}`,
        providerName: [
          "Kenyatta National Hospital",
          "MP Shah Medical Centre",
          "Nairobi Hospital",
          "The Aga Khan Hospital",
          "Coptic Hospital",
        ][i % 5],
        type: types[i % types.length] as any,
        severity: ["critical", "high", "medium"][i % 3] as any,
        status: ["open", "assigned", "investigating"][Math.floor(Math.random() * 3)] as any,
        title: `High-risk claim detected at ${[
          "Kenyatta National Hospital",
          "MP Shah Medical Centre",
          "Nairobi Hospital",
          "The Aga Khan Hospital",
          "Coptic Hospital",
        ][i % 5]}`,
        description: "Patient information does not match IPRS records",
        riskScore: Math.floor(Math.random() * 100) + 50,
        estimatedFraudAmount: Math.floor(Math.random() * 500000) + 50000,
        assignedToName: i % 2 === 0 ? "John Kipchoge" : undefined,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7),
        updatedAt: new Date(),
      });
    }

    return alerts;
  },
};
