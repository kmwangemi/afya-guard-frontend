import { Investigation, InvestigationFilterParams, InvestigationStatus, CreateInvestigationPayload } from "@/types/investigation";
import { PaginatedResponse } from "@/types/common";
import { generateMockId, getRandomElement } from "@/lib/helpers";

// Mock investigation data
const mockInvestigations: Investigation[] = Array.from({ length: 85 }, (_, i) => {
  const statuses: InvestigationStatus[] = ["open", "in_progress", "pending_review", "completed", "closed"];
  const priorities = ["low", "medium", "high", "critical"] as const;
  const outcomes = ["fraud_confirmed", "suspected", "inconclusive", "no_fraud"] as const;
  
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
  createdDate.setDate(createdDate.getDate() - Math.random() * 60);

  const startedDate = new Date(createdDate);
  startedDate.setDate(startedDate.getDate() + 1);

  return {
    id: generateMockId(),
    caseNumber: `INV-${String(i + 1).padStart(5, "0")}`,
    claimId: generateMockId(),
    claimNumber: `CLM-${String(Math.floor(Math.random() * 10000)).padStart(6, "0")}`,
    alertId: generateMockId(),
    alertNumber: `ALERT-${String(Math.floor(Math.random() * 1000)).padStart(5, "0")}`,
    providerId: generateMockId(),
    providerName: getRandomElement(providerNames),
    investigatorId: generateMockId(),
    investigatorName: getRandomElement(investigatorNames),
    priority: getRandomElement(priorities),
    status: getRandomElement(statuses),
    createdAt: createdDate,
    startedAt: startedDate,
    targetDate: new Date(startedDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    completedAt: Math.random() > 0.5 ? new Date() : undefined,
    daysOpen: Math.floor(Math.random() * 60),
    progress: Math.floor(Math.random() * 100),
    findings: "Pattern analysis reveals potential billing irregularities",
    timeline: [
      {
        date: createdDate,
        action: "Alert created",
        investigator: "System",
        notes: "Automatic alert generated",
      },
      {
        date: startedDate,
        action: "Investigation opened",
        investigator: getRandomElement(investigatorNames),
        notes: "Case assigned for investigation",
      },
    ],
    evidence: [
      {
        id: generateMockId(),
        fileName: "claim_analysis.pdf",
        fileType: "pdf",
        fileUrl: "#",
        uploadedBy: getRandomElement(investigatorNames),
        uploadedAt: new Date(),
      },
    ],
    outcome: Math.random() > 0.5 ? {
      outcome: getRandomElement(outcomes),
      fraudConfirmed: Math.random() > 0.6,
      confirmedAmount: Math.random() * 100000,
      recommendations: ["Recover funds", "Review provider contract"],
      actionsTaken: ["Claim denied", "Provider flagged"],
      notes: "Investigation completed with findings",
    } : undefined,
  };
});

export const mockInvestigationsService = {
  async getInvestigations(
    filters: InvestigationFilterParams = {},
    page: number = 1,
    pageSize: number = 25
  ): Promise<PaginatedResponse<Investigation>> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let filtered = [...mockInvestigations];

    if (filters.status) {
      filtered = filtered.filter((i) => i.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter((i) => i.priority === filters.priority);
    }

    if (filters.investigatorId) {
      filtered = filtered.filter((i) => i.investigatorId === filters.investigatorId);
    }

    if (filters.providerId) {
      filtered = filtered.filter((i) => i.providerId === filters.providerId);
    }

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

  async getInvestigationById(investigationId: string): Promise<Investigation | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return mockInvestigations.find((i) => i.id === investigationId) || null;
  },

  async createInvestigation(payload: CreateInvestigationPayload): Promise<Investigation> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const investigation: Investigation = {
      id: generateMockId(),
      caseNumber: `INV-${String(Math.floor(Math.random() * 100000)).padStart(5, "0")}`,
      claimId: payload.claimId || generateMockId(),
      alertId: payload.alertId,
      providerId: generateMockId(),
      providerName: "Provider Name",
      investigatorId: payload.investigatorId,
      investigatorName: "Investigator Name",
      priority: payload.priority,
      status: "open",
      createdAt: new Date(),
      targetDate: payload.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      daysOpen: 0,
      progress: 0,
      timeline: [
        {
          date: new Date(),
          action: "Investigation created",
          investigator: "System",
          notes: payload.notes,
        },
      ],
      evidence: [],
    };

    mockInvestigations.push(investigation);
    return investigation;
  },

  async updateInvestigationStatus(
    investigationId: string,
    status: InvestigationStatus
  ): Promise<Investigation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const investigation = mockInvestigations.find((i) => i.id === investigationId);
    if (investigation) {
      investigation.status = status;
      if (status === "completed") {
        investigation.completedAt = new Date();
        investigation.progress = 100;
      }
    }
    return investigation || null;
  },

  async updateInvestigationProgress(
    investigationId: string,
    progress: number,
    notes?: string
  ): Promise<Investigation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const investigation = mockInvestigations.find((i) => i.id === investigationId);
    if (investigation) {
      investigation.progress = Math.min(100, progress);
      if (notes) {
        investigation.timeline.push({
          date: new Date(),
          action: "Progress updated",
          investigator: investigation.investigatorName,
          notes,
        });
      }
    }
    return investigation || null;
  },

  async addInvestigationEvidence(
    investigationId: string,
    evidence: {
      fileName: string;
      fileType: string;
      fileUrl: string;
      uploadedBy: string;
      description?: string;
    }
  ): Promise<Investigation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const investigation = mockInvestigations.find((i) => i.id === investigationId);
    if (investigation) {
      investigation.evidence.push({
        id: generateMockId(),
        ...evidence,
        uploadedAt: new Date(),
      });
    }
    return investigation || null;
  },

  async closeInvestigation(
    investigationId: string,
    outcome: Investigation["outcome"],
    notes?: string
  ): Promise<Investigation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const investigation = mockInvestigations.find((i) => i.id === investigationId);
    if (investigation) {
      investigation.status = "completed";
      investigation.outcome = outcome;
      investigation.completedAt = new Date();
      investigation.progress = 100;
      if (notes) {
        investigation.notes = notes;
      }
    }
    return investigation || null;
  },

  async getInvestigationStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    avgDaysToComplete: number;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const completed = mockInvestigations.filter((i) => i.status === "completed");
    const avgDays = completed.length > 0
      ? completed.reduce((sum, i) => sum + i.daysOpen, 0) / completed.length
      : 0;

    return {
      total: mockInvestigations.length,
      open: mockInvestigations.filter((i) => i.status === "open").length,
      inProgress: mockInvestigations.filter((i) => i.status === "in_progress").length,
      completed: completed.length,
      avgDaysToComplete: Math.round(avgDays),
    };
  },
};
