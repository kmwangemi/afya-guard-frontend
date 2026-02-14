import { Alert, AlertFilterParams, AlertStatus } from "@/types/alert";
import { PaginatedResponse } from "@/types/common";
import { generateMockId, getRandomElement } from "@/lib/helpers";

// Mock alert data
const mockAlerts: Alert[] = Array.from({ length: 150 }, (_, i) => {
  const alertTypes = [
    "high_risk_claim",
    "phantom_patient",
    "upcoding",
    "duplicate_claim",
    "provider_anomaly",
    "volume_spike",
    "pattern_detected",
  ] as const;
  
  const severities = ["low", "medium", "high", "critical"] as const;
  const statuses: AlertStatus[] = ["open", "assigned", "investigating", "resolved", "closed"];
  
  const investigatorNames = [
    "Jane Smith",
    "John Omondi",
    "Maria Garcia",
    "Ahmed Hassan",
    "Sarah Wilson",
  ];
  
  const providerNames = [
    "Nairobi Central Hospital",
    "Kenyatta National Hospital",
    "Mombasa County Hospital",
    "Kisumu Medical Center",
    "Nakuru Clinic",
  ];

  const createdDate = new Date();
  createdDate.setDate(createdDate.getDate() - Math.random() * 30);

  return {
    id: generateMockId(),
    alertNumber: `ALERT-${String(i + 1).padStart(5, "0")}`,
    claimId: generateMockId(),
    claimNumber: `CLM-${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`,
    providerId: generateMockId(),
    providerName: getRandomElement(providerNames),
    type: getRandomElement(alertTypes),
    severity: getRandomElement(severities),
    status: getRandomElement(statuses),
    title: `Alert: ${getRandomElement(alertTypes).replace(/_/g, " ")}`,
    description: "Potential fraud pattern detected in claim processing",
    riskScore: Math.floor(Math.random() * 100),
    estimatedFraudAmount: Math.random() * 500000,
    assignedTo: Math.random() > 0.3 ? generateMockId() : undefined,
    assignedToName: Math.random() > 0.3 ? getRandomElement(investigatorNames) : undefined,
    createdAt: createdDate,
    updatedAt: new Date(),
    actionTaken: "Under review",
  };
});

export const mockAlertsService = {
  async getAlerts(
    filters: AlertFilterParams = {},
    page: number = 1,
    pageSize: number = 25
  ): Promise<PaginatedResponse<Alert>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockAlerts];

    if (filters.severity) {
      filtered = filtered.filter((a) => a.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter((a) => a.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter((a) => a.type === filters.type);
    }

    if (filters.providerId) {
      filtered = filtered.filter((a) => a.providerId === filters.providerId);
    }

    if (filters.claimId) {
      filtered = filtered.filter((a) => a.claimId === filters.claimId);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter((a) => a.assignedTo === filters.assignedTo);
    }

    // Sort by created date descending
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  },

  async getAlertById(alertId: string): Promise<Alert | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockAlerts.find((a) => a.id === alertId) || null;
  },

  async updateAlertStatus(alertId: string, status: AlertStatus): Promise<Alert | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const alert = mockAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date();
    }
    return alert || null;
  },

  async assignAlert(alertId: string, investigatorId: string, investigatorName: string): Promise<Alert | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const alert = mockAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.assignedTo = investigatorId;
      alert.assignedToName = investigatorName;
      alert.status = "assigned";
      alert.updatedAt = new Date();
    }
    return alert || null;
  },

  async resolveAlert(
    alertId: string,
    resolutionNotes: string,
    actionTaken?: string
  ): Promise<Alert | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const alert = mockAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "resolved";
      alert.resolutionNotes = resolutionNotes;
      alert.actionTaken = actionTaken;
      alert.resolvedAt = new Date();
      alert.updatedAt = new Date();
    }
    return alert || null;
  },

  async getCriticalAlerts(limit: number = 10): Promise<Alert[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockAlerts
      .filter((a) => a.severity === "critical" || a.severity === "high")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  async getAlertStats(): Promise<{
    total: number;
    open: number;
    assigned: number;
    investigating: number;
    critical: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return {
      total: mockAlerts.length,
      open: mockAlerts.filter((a) => a.status === "open").length,
      assigned: mockAlerts.filter((a) => a.status === "assigned").length,
      investigating: mockAlerts.filter((a) => a.status === "investigating").length,
      critical: mockAlerts.filter((a) => a.severity === "critical").length,
    };
  },
};
