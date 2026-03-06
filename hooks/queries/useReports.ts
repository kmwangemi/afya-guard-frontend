// Fix 3: real react-query hooks replacing in-component local state
import { reportsService } from '@/services/reportsService';
import { GenerateReportPayload, ReportFilterParams } from '@/types/report';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const REPORTS_KEY = 'reports';

// ─── Query hooks ──────────────────────────────────────────────────────────────

// Fix 4+5: fetches combined ReportListResponse { stats, items, ... }
export function useReports(
  filters: ReportFilterParams = {},
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'list', filters, page, pageSize],
    queryFn: () => reportsService.getReports(filters, page, pageSize),
    staleTime: 2 * 60 * 1000,
  });
}
// Fix 9: full detail with key_metrics, summary_text etc.
export function useReportById(reportId: string, enabled = true) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'detail', reportId],
    queryFn: () => reportsService.getReportById(reportId),
    enabled: !!reportId && enabled,
    staleTime: 5 * 60 * 1000,
  });
}
// Fix 8: download endpoint — fetches download_url from backend
export function useReportDownload(reportId: string, enabled = false) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'download', reportId],
    queryFn: () => reportsService.getDownload(reportId),
    enabled: !!reportId && enabled,
    staleTime: 0, // always fresh for downloads
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

// Fix 6+7: real POST /reports; invalidates list cache instead of local state mutation
export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateReportPayload) =>
      reportsService.generateReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY, 'list'] });
    },
  });
}
// Fix 22: DELETE /reports/{id}
export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) => reportsService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTS_KEY, 'list'] });
    },
  });
}
