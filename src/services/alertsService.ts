import api from '@/lib/api';
import type { AlertFilters } from '@/lib/validations';
import type { Alert } from '@/types/alert';
import type { ApiResponse, PaginatedResponse } from '@/types/common';

export const alertsService = {
  getAlerts: async (page = 1, limit = 20, filters?: Partial<AlertFilters>) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.severity && { severity: filters.severity }),
      ...(filters?.date_from && { date_from: filters.date_from }),
      ...(filters?.date_to && { date_to: filters.date_to }),
      ...(filters?.assigned_to && { assigned_to: filters.assigned_to }),
    });
    const response = await api.get<ApiResponse<PaginatedResponse<Alert>>>(
      `/alerts?${params.toString()}`,
    );
    return response.data.data;
  },
  getAlertById: async (id: number) => {
    const response = await api.get<ApiResponse<Alert>>(`/alerts/${id}`);
    return response.data.data;
  },
  updateAlertStatus: async (id: number, status: string) => {
    const response = await api.patch<ApiResponse<Alert>>(
      `/alerts/${id}/status`,
      { status },
    );
    return response.data.data;
  },
  assignAlert: async (id: number, investigator_id: number) => {
    const response = await api.patch<ApiResponse<Alert>>(
      `/alerts/${id}/assign`,
      { investigator_id },
    );
    return response.data.data;
  },
  getCriticalAlerts: async (limit = 10) => {
    const response = await api.get<ApiResponse<Alert[]>>(
      `/alerts/critical?limit=${limit}`,
    );
    return response.data.data;
  },
};
