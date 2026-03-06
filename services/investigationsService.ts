import { api } from '@/lib/api';
import { PaginatedResponse } from '@/types/common';
import {
  CaseNote,
  CasePriority,
  CaseStatus,
  CreateInvestigationPayload,
  InvestigationDetail,
  InvestigationFilterParams,
  InvestigationListItem,
  UpdateProgressPayload,
  UpdateStatusPayload,
  UploadEvidencePayload,
} from '@/types/investigation';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface ApiListItem {
  id: string;
  inv_number: string;
  investigator_name: string | null;
  investigator_id: string | null;
  provider_name: string | null;
  provider_id: string | null;
  claim_id: string;
  sha_claim_id: string | null;
  status: string;
  priority: string;
  progress: number;
  opened_at: string;
  closed_at: string | null;
  risk_level: string | null;
  final_score: number | null;
  note_count: number;
}

interface ApiDetail {
  id: string;
  inv_number: string;
  subtitle: string;
  stat_cards: {
    status: string;
    priority: string;
    days_open: number;
    progress: number;
  };
  investigation_details: {
    investigator_name: string | null;
    investigator_id: string | null;
    related_claim: string | null;
    claim_id: string | null;
    created_at: string;
    target_date: string | null;
    closed_at: string | null;
  };
  findings: string | null;
  timeline: {
    event: string;
    actor: string | null;
    note: string | null;
    timestamp: string;
  }[];
  evidence: {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string | null;
    uploaded_by: string | null;
    uploaded_at: string | null;
  }[];
  summary: {
    alert_number: string | null;
    alert_id: string | null;
    claim_number: string | null;
    claim_id: string | null;
    provider_name: string | null;
    provider_id: string | null;
    investigator_name: string | null;
    investigator_id: string | null;
  };
  quick_actions: {
    available_status_transitions: string[];
    can_close: boolean;
    can_update_progress: boolean;
    can_assign: boolean;
    can_upload_evidence: boolean;
  };
  notes: {
    id: string;
    case_id: string;
    note: string;
    created_at: string;
    author_name: string | null;
    author_id: string | null;
  }[];
  status: string;
  priority: string;
  progress: number;
  opened_at: string;
  closed_at: string | null;
  claim_id: string;
  fraud_score_id: string;
  assigned_analyst_id: string | null;
  resolution_summary: string | null;
  estimated_loss: number | null;
}

interface ApiPaginated {
  items: ApiListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapListItem(a: ApiListItem): InvestigationListItem {
  return {
    id: a.id,
    invNumber: a.inv_number,
    investigatorName: a.investigator_name,
    investigatorId: a.investigator_id,
    providerName: a.provider_name,
    providerId: a.provider_id,
    claimId: a.claim_id,
    shaClaimId: a.sha_claim_id,
    status: a.status as CaseStatus,
    priority: a.priority as CasePriority,
    progress: a.progress,
    openedAt: a.opened_at,
    closedAt: a.closed_at,
    riskLevel: a.risk_level,
    finalScore: a.final_score,
    noteCount: a.note_count,
  };
}

function mapDetail(a: ApiDetail): InvestigationDetail {
  return {
    id: a.id,
    invNumber: a.inv_number,
    subtitle: a.subtitle,
    statCards: {
      status: a.stat_cards.status as CaseStatus,
      priority: a.stat_cards.priority as CasePriority,
      daysOpen: a.stat_cards.days_open,
      progress: a.stat_cards.progress,
    },
    investigationDetails: {
      investigatorName: a.investigation_details.investigator_name,
      investigatorId: a.investigation_details.investigator_id,
      relatedClaim: a.investigation_details.related_claim,
      claimId: a.investigation_details.claim_id,
      createdAt: a.investigation_details.created_at,
      targetDate: a.investigation_details.target_date,
      closedAt: a.investigation_details.closed_at,
    },
    findings: a.findings,
    timeline: a.timeline.map(t => ({
      event: t.event,
      actor: t.actor,
      note: t.note,
      timestamp: t.timestamp,
    })),
    evidence: a.evidence.map(e => ({
      id: e.id,
      fileName: e.file_name,
      fileType: e.file_type,
      fileUrl: e.file_url,
      uploadedBy: e.uploaded_by,
      uploadedAt: e.uploaded_at,
    })),
    summary: {
      alertNumber: a.summary.alert_number,
      alertId: a.summary.alert_id,
      claimNumber: a.summary.claim_number,
      claimId: a.summary.claim_id,
      providerName: a.summary.provider_name,
      providerId: a.summary.provider_id,
      investigatorName: a.summary.investigator_name,
      investigatorId: a.summary.investigator_id,
    },
    quickActions: {
      availableStatusTransitions: a.quick_actions
        .available_status_transitions as CaseStatus[],
      canClose: a.quick_actions.can_close,
      canUpdateProgress: a.quick_actions.can_update_progress,
      canAssign: a.quick_actions.can_assign,
      canUploadEvidence: a.quick_actions.can_upload_evidence,
    },
    notes: a.notes.map(n => ({
      id: n.id,
      caseId: n.case_id,
      note: n.note,
      createdAt: n.created_at,
      authorName: n.author_name,
      authorId: n.author_id,
    })),
    status: a.status as CaseStatus,
    priority: a.priority as CasePriority,
    progress: a.progress,
    openedAt: a.opened_at,
    closedAt: a.closed_at,
    claimId: a.claim_id,
    fraudScoreId: a.fraud_score_id,
    assignedAnalystId: a.assigned_analyst_id,
    resolutionSummary: a.resolution_summary,
    estimatedLoss: a.estimated_loss,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const investigationsService = {
  // GET /api/v1/investigations
  getInvestigations: async (
    filters: InvestigationFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<PaginatedResponse<InvestigationListItem>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assignedTo) params.set('assigned_to', filters.assignedTo);
    if (filters.openedFrom) params.set('opened_from', filters.openedFrom);
    if (filters.openedTo) params.set('opened_to', filters.openedTo);
    const response = await api.get<ApiPaginated>(`/investigations?${params}`);
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
  // Fix 8: returns InvestigationDetailResponse (nested), not flat Investigation
  getInvestigationById: async (id: string): Promise<InvestigationDetail> => {
    const detail = await api.get<ApiDetail>(`/investigations/${id}`);
    return mapDetail(detail);
  },
  // Fix 9: claim_id and fraud_score_id are required; investigatorId removed
  // POST /api/v1/investigations
  createInvestigation: async (
    payload: CreateInvestigationPayload,
  ): Promise<InvestigationDetail> => {
    const detail = await api.post<ApiDetail>('/investigations', {
      claim_id: payload.claimId,
      fraud_score_id: payload.fraudScoreId,
      priority: payload.priority,
      assigned_to: payload.assignedTo,
      target_date: payload.targetDate,
      notes: payload.notes,
    });
    return mapDetail(detail);
  },
  // Fix 10: PATCH /investigations/{id}/status with { status, resolution_summary?, estimated_loss? }
  updateStatus: async (
    id: string,
    payload: UpdateStatusPayload,
  ): Promise<InvestigationDetail> => {
    const detail = await api.patch<ApiDetail>(`/investigations/${id}/status`, {
      status: payload.status,
      resolution_summary: payload.resolutionSummary,
      estimated_loss: payload.estimatedLoss,
    });
    return mapDetail(detail);
  },
  // Fix 11: PATCH /investigations/{id}/progress with { progress, findings? }
  updateProgress: async (
    id: string,
    payload: UpdateProgressPayload,
  ): Promise<InvestigationDetail> => {
    const detail = await api.patch<ApiDetail>(
      `/investigations/${id}/progress`,
      {
        progress: payload.progress,
        findings: payload.findings,
      },
    );
    return mapDetail(detail);
  },
  // PATCH /investigations/{id}/assign
  assignInvestigation: async (
    id: string,
    assignedTo: string,
  ): Promise<InvestigationDetail> => {
    const detail = await api.patch<ApiDetail>(`/investigations/${id}/assign`, {
      assigned_to: assignedTo,
    });
    return mapDetail(detail);
  },
  // Fix 12: POST /investigations/{id}/evidence with { file_name, file_type, file_url }
  // uploadedBy removed — backend derives it from auth token
  uploadEvidence: async (
    id: string,
    payload: UploadEvidencePayload,
  ): Promise<InvestigationDetail> => {
    const detail = await api.post<ApiDetail>(`/investigations/${id}/evidence`, {
      file_name: payload.fileName,
      file_type: payload.fileType,
      file_url: payload.fileUrl,
    });
    return mapDetail(detail);
  },
  // POST /investigations/{id}/notes
  addNote: async (id: string, note: string): Promise<CaseNote> => {
    return api.post(`/investigations/${id}/notes`, { note });
  },
  // GET /investigations/{id}/notes
  getNotes: async (id: string): Promise<CaseNote[]> => {
    return api.get(`/investigations/${id}/notes`);
  },
  // Fix 13: no dedicated close endpoint — use PATCH /investigations/{id}/status
  // with a terminal status + required resolution_summary
  closeInvestigation: async (
    id: string,
    status: 'CONFIRMED_FRAUD' | 'CLEARED' | 'CLOSED',
    resolutionSummary: string,
    estimatedLoss?: number,
  ): Promise<InvestigationDetail> => {
    return investigationsService.updateStatus(id, {
      status,
      resolutionSummary,
      estimatedLoss,
    });
  },
};
