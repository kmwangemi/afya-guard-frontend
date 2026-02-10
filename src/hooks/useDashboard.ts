'use client';

import api from '@/lib/api';
import type { ApiResponse, DashboardStats } from '@/types/common';
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
