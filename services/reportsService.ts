import { api } from '@/lib/api';
import {
  GenerateReportPayload,
  ReportDetail,
  ReportFilterParams,
  ReportKeyMetrics,
  ReportListItem,
  ReportListResponse,
  ReportListStats,
  ReportStatus,
  ReportType,
} from '@/types/report';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface ApiReportListItem {
  id: string;
  name: string;
  report_type: string;
  period_label: string | null;
  status: string;
  record_count: number;
  generated_at: string;
  generated_by_name: string | null;
  can_download: boolean;
  download_url: string | null;
}

interface ApiReportListStats {
  total_reports: number;
  completed: number;
  processing: number;
  total_records: number;
}

interface ApiReportListResponse {
  stats: ApiReportListStats;
  items: ApiReportListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface ApiKeyMetrics {
  fraud_detection_rate: number;
  fraud_amount_detected: number;
  alert_cases_generated: number;
}

interface ApiReportDetail {
  id: string;
  name: string;
  report_type: string;
  status: string;
  period_label: string | null;
  record_count: number;
  summary_text: string | null;
  key_metrics: ApiKeyMetrics;
  generated_at: string;
  completed_at: string | null;
  generated_by_name: string | null;
  custom_notes: string | null;
  can_download: boolean;
  download_url: string | null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapListItem(a: ApiReportListItem): ReportListItem {
  return {
    id: a.id,
    name: a.name,
    reportType: a.report_type as ReportType,
    periodLabel: a.period_label,
    status: a.status as ReportStatus,
    recordCount: a.record_count,
    generatedAt: a.generated_at,
    generatedByName: a.generated_by_name,
    canDownload: a.can_download,
    downloadUrl: a.download_url,
  };
}

function mapStats(a: ApiReportListStats): ReportListStats {
  return {
    totalReports: a.total_reports,
    completed: a.completed,
    processing: a.processing,
    totalRecords: a.total_records,
  };
}

function mapKeyMetrics(a: ApiKeyMetrics): ReportKeyMetrics {
  return {
    fraudDetectionRate: a.fraud_detection_rate,
    fraudAmountDetected: a.fraud_amount_detected,
    alertCasesGenerated: a.alert_cases_generated,
  };
}

function mapDetail(a: ApiReportDetail): ReportDetail {
  return {
    id: a.id,
    name: a.name,
    reportType: a.report_type as ReportType,
    status: a.status as ReportStatus,
    periodLabel: a.period_label,
    recordCount: a.record_count,
    summaryText: a.summary_text,
    keyMetrics: mapKeyMetrics(
      a.key_metrics ?? {
        fraud_detection_rate: 0,
        fraud_amount_detected: 0,
        alert_cases_generated: 0,
      },
    ),
    generatedAt: a.generated_at,
    completedAt: a.completed_at,
    generatedByName: a.generated_by_name,
    customNotes: a.custom_notes,
    canDownload: a.can_download,
    downloadUrl: a.download_url,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const reportsService = {
  // Fix 4+5: GET /api/v1/reports → returns combined { stats, items, ... }
  getReports: async (
    filters: ReportFilterParams = {},
    page: number = 1,
    pageSize: number = 25,
  ): Promise<ReportListResponse> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('page_size', String(pageSize));
    if (filters.search) params.set('search', filters.search);
    if (filters.reportType) params.set('report_type', filters.reportType);
    if (filters.status) params.set('status', filters.status);

    const response = await api.get<ApiReportListResponse>(`/reports?${params}`);
    return {
      stats: mapStats(response.stats),
      items: response.items.map(mapListItem),
      total: response.total,
      page: response.page,
      pageSize: response.page_size,
      pages: response.pages,
    };
  },
  // Fix 9: GET /api/v1/reports/{id} → returns full ReportDetailResponse with key_metrics
  getReportById: async (id: string): Promise<ReportDetail> => {
    const detail = await api.get<ApiReportDetail>(`/reports/${id}`);
    return mapDetail(detail);
  },
  // Fix 6: POST /api/v1/reports — real generate with correct field names
  generateReport: async (
    payload: GenerateReportPayload,
  ): Promise<ReportDetail> => {
    const detail = await api.post<ApiReportDetail>('/reports', {
      name: payload.name,
      report_type: payload.reportType,
      date_range_preset: payload.dateRangePreset ?? 'month',
      period_start: payload.periodStart,
      period_end: payload.periodEnd,
      custom_notes: payload.customNotes,
    });
    return mapDetail(detail);
  },
  // Fix 8: GET /api/v1/reports/{id}/download — gets download_url from backend
  getDownload: async (id: string): Promise<ReportDetail> => {
    const detail = await api.get<ApiReportDetail>(`/reports/${id}/download`);
    return mapDetail(detail);
  },
  // Fix 22: DELETE /api/v1/reports/{id}
  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },
};
