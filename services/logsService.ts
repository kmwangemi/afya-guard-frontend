import { api } from '@/lib/api';
import { PaginatedResponse } from '@/types/common';
import { AuditAction, AuditLogEntry, LogFilterParams } from '@/types/log';

interface ApiLogEntry {
  id: string;
  user_id: string | null;
  user_full_name: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  performed_at: string;
}

interface ApiPaginated {
  items: ApiLogEntry[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

function mapEntry(a: ApiLogEntry): AuditLogEntry {
  return {
    id: a.id,
    userId: a.user_id,
    userFullName: a.user_full_name,
    userEmail: a.user_email,
    action: a.action as AuditAction,
    entityType: a.entity_type,
    entityId: a.entity_id,
    metadata: a.metadata ?? {},
    ipAddress: a.ip_address,
    userAgent: a.user_agent,
    performedAt: a.performed_at,
  };
}

export const logsService = {
  // GET /api/v1/logs (admin only — requires manage_users permission)
  getLogs: async (
    filters: LogFilterParams = {},
    page: number = 1,
    pageSize: number = 50,
  ): Promise<PaginatedResponse<AuditLogEntry>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.action) params.set('action', filters.action);
    if (filters.entityType) params.set('entity_type', filters.entityType);
    if (filters.userId) params.set('user_id', filters.userId);
    if (filters.fromDate) params.set('from_date', filters.fromDate);
    if (filters.toDate) params.set('to_date', filters.toDate);
    const response = await api.get<ApiPaginated>(`/logs?${params}`);
    return {
      data: response.items.map(mapEntry),
      pagination: {
        page: response.page,
        pageSize: response.page_size,
        total: response.total,
        totalPages: response.pages,
        hasMore: response.page < response.pages,
      },
    };
  },
};
