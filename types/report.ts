// ─── Report domain types ──────────────────────────────────────────────────────
// Aligned to backend ReportType, ReportStatus, DateRangePreset enums and
// ReportListResponse / ReportDetailResponse schemas

// Backend ReportType — lowercase (unlike alert/case enums)
export type ReportType = 'summary' | 'provider' | 'investigation' | 'county';

// Backend ReportStatus — lowercase
export type ReportStatus = 'processing' | 'completed' | 'scheduled' | 'failed';

// Backend DateRangePreset — lowercase
export type DateRangePreset = 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ── List item (inside GET /reports ReportListResponse) ────────────────────────
export interface ReportListItem {
  id: string;
  name: string;
  reportType: ReportType;
  periodLabel: string | null;
  status: ReportStatus;
  recordCount: number;
  generatedAt: string; // ISO datetime string
  generatedByName: string | null;
  canDownload: boolean; // derived by backend — true only when completed
  downloadUrl: string | null;
}

// ── Stat cards (top of Reports page) ─────────────────────────────────────────
export interface ReportListStats {
  totalReports: number;
  completed: number;
  processing: number;
  totalRecords: number;
}

// ── Combined list response (GET /reports) — stats + paginated items in one call
export interface ReportListResponse {
  stats: ReportListStats;
  items: ReportListItem[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

// ── Key metrics shown in View Report dialog ───────────────────────────────────
export interface ReportKeyMetrics {
  fraudDetectionRate: number; // % e.g. 12.0
  fraudAmountDetected: number; // KES e.g. 63195.112
  alertCasesGenerated: number; // int e.g. 91
}

// ── Full detail response (GET /reports/{id}) ──────────────────────────────────
export interface ReportDetail {
  id: string;
  name: string;
  reportType: ReportType;
  status: ReportStatus;
  periodLabel: string | null;
  recordCount: number;
  summaryText: string | null; // Report Summary card text
  keyMetrics: ReportKeyMetrics;
  generatedAt: string; // ISO datetime
  completedAt: string | null;
  generatedByName: string | null;
  customNotes: string | null;
  canDownload: boolean;
  downloadUrl: string | null;
}

// ── Generate report payload (POST /reports) ───────────────────────────────────
export interface GenerateReportPayload {
  name: string;
  reportType: ReportType;
  dateRangePreset?: DateRangePreset;
  periodStart?: string; // ISO datetime — required when preset = 'custom'
  periodEnd?: string; // ISO datetime — required when preset = 'custom'
  customNotes?: string;
}

// ── Filter params ─────────────────────────────────────────────────────────────
export interface ReportFilterParams {
  search?: string;
  reportType?: ReportType;
  status?: ReportStatus;
}
