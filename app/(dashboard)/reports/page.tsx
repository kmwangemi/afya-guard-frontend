'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  useDeleteReport,
  useGenerateReport,
  useReportById,
  useReports,
} from '@/hooks/queries/useReports';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDateTime } from '@/lib/helpers';
import {
  DateRangePreset,
  GenerateReportPayload,
  ReportFilterParams,
  ReportListItem,
  ReportStatus,
  ReportType,
} from '@/types/report';
import { Download, Eye, FileText, Loader, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Fix 13+16: type labels for reportType field (was report.type)
const TYPE_LABELS: Record<ReportType, string> = {
  summary: 'Summary',
  provider: 'Provider Analysis',
  investigation: 'Investigation',
  county: 'County Analysis',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  completed: 'Completed',
  processing: 'Processing',
  scheduled: 'Scheduled',
  failed: 'Failed',
};

export default function ReportsPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [reportType, setReportType] = useState('');
  // Fix 18: added status filter — was missing from UI
  const [statusFilter, setStatusFilter] = useState('');

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewReportId, setViewReportId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Fix 19: form uses reportType (not type), dateRangePreset, customNotes
  const [generationForm, setGenerationForm] = useState<{
    name: string;
    reportType: ReportType | '';
    dateRangePreset: DateRangePreset;
    periodStart: string;
    periodEnd: string;
    customNotes: string;
  }>({
    name: '',
    reportType: '',
    dateRangePreset: 'month',
    periodStart: '',
    periodEnd: '',
    customNotes: '',
  });

  const filters: ReportFilterParams = {};
  if (search) filters.search = search;
  if (reportType && reportType !== 'all')
    filters.reportType = reportType as ReportType;
  // Fix 18: status filter wired to API
  if (statusFilter && statusFilter !== 'all')
    filters.status = statusFilter as ReportStatus;
  // Fix 3+4+5: useReports returns combined { stats, items, total, pages }
  const { data: reportsResponse, isLoading } = useReports(
    filters,
    page,
    pageSize,
  );

  // Fix 9+10+12: full detail fetched from backend — includes key_metrics + summary_text
  const { data: reportDetail, isLoading: isLoadingDetail } = useReportById(
    viewReportId ?? '',
    viewDialogOpen && !!viewReportId,
  );

  // Fix 6+7: POST /reports + cache invalidation
  const generateReport = useGenerateReport();
  // Fix 22: DELETE /reports/{id}
  const deleteReport = useDeleteReport();

  const handleGenerateReport = async () => {
    if (!generationForm.name.trim() || !generationForm.reportType) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    if (
      generationForm.dateRangePreset === 'custom' &&
      (!generationForm.periodStart || !generationForm.periodEnd)
    ) {
      toast({
        title: 'Error',
        description: 'Period start and end required for custom date range.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const payload: GenerateReportPayload = {
        name: generationForm.name.trim(),
        // Fix 19: field name is reportType (maps to report_type in service)
        reportType: generationForm.reportType as ReportType,
        dateRangePreset: generationForm.dateRangePreset,
        customNotes: generationForm.customNotes || undefined,
        periodStart:
          generationForm.dateRangePreset === 'custom'
            ? generationForm.periodStart
            : undefined,
        periodEnd:
          generationForm.dateRangePreset === 'custom'
            ? generationForm.periodEnd
            : undefined,
      };
      await generateReport.mutateAsync(payload);
      // Fix 7: no local state mutation — cache invalidated by hook onSuccess
      setGenerateDialogOpen(false);
      setGenerationForm({
        name: '',
        reportType: '',
        dateRangePreset: 'month',
        periodStart: '',
        periodEnd: '',
        customNotes: '',
      });
      toast({
        title: 'Success',
        description: 'Report generated successfully.',
      });
    } catch (err) {
      console.error('[reports] generate error:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate report.',
        variant: 'destructive',
      });
    }
  };

  // Fix 8: download via backend URL — GET /reports/{id}/download provides download_url
  const handleDownloadReport = async (report: ReportListItem) => {
    if (!report.canDownload) {
      toast({
        title: 'Info',
        description: 'Report is still processing. Please try again later.',
      });
      return;
    }
    try {
      const detail = await reportsService_getDownload(report.id);
      if (detail.downloadUrl) {
        // Use backend-provided URL if available
        window.open(detail.downloadUrl, '_blank');
      } else {
        // Fallback: construct JSON download from detail data
        const dataStr = JSON.stringify(
          {
            name: detail.name,
            type: detail.reportType,
            period: detail.periodLabel,
            recordCount: detail.recordCount,
            keyMetrics: detail.keyMetrics,
          },
          null,
          2,
        );
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${detail.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      toast({ title: 'Success', description: `Downloaded ${report.name}.` });
    } catch (err) {
      console.error('[reports] download error:', err);
      toast({
        title: 'Error',
        description: 'Failed to download report.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReport = async (reportId: string, reportName: string) => {
    try {
      await deleteReport.mutateAsync(reportId);
      toast({
        title: 'Deleted',
        description: `${reportName} has been deleted.`,
      });
    } catch (err) {
      console.error('[reports] delete error:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete report.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Reports</h1>
            <p className='text-gray-600 mt-1'>
              Generate and manage fraud detection reports and analytics
            </p>
          </div>
          <Button
            className='bg-blue-600 hover:bg-blue-700'
            onClick={() => setGenerateDialogOpen(true)}
          >
            <Plus className='h-4 w-4 mr-2' />
            Generate Report
          </Button>
        </div>
        {/* Fix 5: Stat cards from response.stats (not mockReports.filter()) */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Total Reports</p>
            <p className='text-2xl font-bold text-gray-900'>
              {isLoading ? '—' : (reportsResponse?.stats.totalReports ?? 0)}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Completed</p>
            <p className='text-2xl font-bold text-green-600'>
              {isLoading ? '—' : (reportsResponse?.stats.completed ?? 0)}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Processing</p>
            <p className='text-2xl font-bold text-blue-600'>
              {isLoading ? '—' : (reportsResponse?.stats.processing ?? 0)}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Total Records</p>
            <p className='text-2xl font-bold text-gray-900'>
              {isLoading
                ? '—'
                : (reportsResponse?.stats.totalRecords ?? 0).toLocaleString()}
            </p>
          </Card>
        </div>
        {/* Filters — Fix 18: added status filter */}
        <Card className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Input
              placeholder='Search reports...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={reportType || 'all'}
              onValueChange={v => {
                setReportType(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All report types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                <SelectItem value='summary'>Summary</SelectItem>
                <SelectItem value='provider'>Provider Analysis</SelectItem>
                <SelectItem value='investigation'>Investigation</SelectItem>
                <SelectItem value='county'>County Analysis</SelectItem>
              </SelectContent>
            </Select>
            {/* Fix 18: status filter was entirely missing */}
            <Select
              value={statusFilter || 'all'}
              onValueChange={v => {
                setStatusFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='processing'>Processing</SelectItem>
                <SelectItem value='scheduled'>Scheduled</SelectItem>
                <SelectItem value='failed'>Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={String(pageSize)}
              onValueChange={v => setPageSize(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='25'>25 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        {/* Reports Table */}
        <Card className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Report Name</TableHead>
                <TableHead className='font-semibold'>Type</TableHead>
                <TableHead className='font-semibold'>Period</TableHead>
                <TableHead className='font-semibold'>Status</TableHead>
                <TableHead className='font-semibold'>Records</TableHead>
                <TableHead className='font-semibold'>Generated</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-20 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
                      Loading reports...
                    </div>
                  </TableCell>
                </TableRow>
              ) : !reportsResponse?.items?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='h-20 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <FileText className='h-8 w-8 text-gray-300' />
                      No reports found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reportsResponse.items.map(report => (
                  <TableRow key={report.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium text-gray-900'>
                      {report.name}
                    </TableCell>
                    <TableCell>
                      {/* Fix 13: was report.type → report.reportType */}
                      <span className='text-sm text-gray-700'>
                        {TYPE_LABELS[report.reportType]}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm text-gray-700'>
                      {report.periodLabel ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[report.status]}>
                        {STATUS_LABELS[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {/* Fix 16: was report.recordCount → report.recordCount (mapped correctly) */}
                      {report.recordCount.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {/* Fix 14: generatedAt is ISO string — wrap with new Date() */}
                      {formatDateTime(new Date(report.generatedAt))}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex gap-1 justify-end'>
                        {/* Fix 20: canDownload comes from backend, not local status check */}
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={!report.canDownload}
                          onClick={() => handleDownloadReport(report)}
                          title={
                            !report.canDownload
                              ? 'Report must be completed to download'
                              : 'Download report'
                          }
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setViewReportId(report.id);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        {/* Fix 22: delete action */}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleDeleteReport(report.id, report.name)
                          }
                          disabled={deleteReport.isPending}
                          className='text-red-500 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        {/* Fix 21: pagination — was missing entirely */}
        {!isLoading && reportsResponse && (
          <Pagination
            page={page}
            totalPages={reportsResponse.pages}
            onPageChange={setPage}
            total={reportsResponse.total}
            pageSize={pageSize}
          />
        )}
        {/* Generate Report Dialog — Fix 19: form fields use reportType/dateRangePreset */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Create a new fraud detection report with custom parameters and
                analysis.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Report Name *
                </label>
                <Input
                  placeholder='E.g., Monthly Fraud Analysis'
                  value={generationForm.name}
                  onChange={e =>
                    setGenerationForm({
                      ...generationForm,
                      name: e.target.value,
                    })
                  }
                  className='mt-1'
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Report Type *
                  </label>
                  <Select
                    value={generationForm.reportType}
                    onValueChange={v =>
                      setGenerationForm({
                        ...generationForm,
                        reportType: v as ReportType,
                      })
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Select report type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='summary'>Summary</SelectItem>
                      <SelectItem value='provider'>
                        Provider Analysis
                      </SelectItem>
                      <SelectItem value='investigation'>
                        Investigation
                      </SelectItem>
                      <SelectItem value='county'>County Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Date Range
                  </label>
                  <Select
                    value={generationForm.dateRangePreset}
                    onValueChange={v =>
                      setGenerationForm({
                        ...generationForm,
                        dateRangePreset: v as DateRangePreset,
                      })
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='week'>This Week</SelectItem>
                      <SelectItem value='month'>This Month</SelectItem>
                      <SelectItem value='quarter'>This Quarter</SelectItem>
                      <SelectItem value='year'>This Year</SelectItem>
                      <SelectItem value='custom'>Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Custom date range fields — only shown when preset = custom */}
              {generationForm.dateRangePreset === 'custom' && (
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      Period Start *
                    </label>
                    <Input
                      type='datetime-local'
                      value={generationForm.periodStart}
                      onChange={e =>
                        setGenerationForm({
                          ...generationForm,
                          periodStart: e.target.value,
                        })
                      }
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-700'>
                      Period End *
                    </label>
                    <Input
                      type='datetime-local'
                      value={generationForm.periodEnd}
                      onChange={e =>
                        setGenerationForm({
                          ...generationForm,
                          periodEnd: e.target.value,
                        })
                      }
                      className='mt-1'
                    />
                  </div>
                </div>
              )}
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Additional Notes
                </label>
                <Textarea
                  placeholder='Add any specific parameters or notes for this report...'
                  value={generationForm.customNotes}
                  onChange={e =>
                    setGenerationForm({
                      ...generationForm,
                      customNotes: e.target.value,
                    })
                  }
                  className='mt-1'
                  rows={3}
                />
              </div>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <p className='text-sm text-blue-900'>
                  <strong>Note:</strong> Report generation typically takes 30
                  seconds to 2 minutes depending on data volume and report
                  complexity.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setGenerateDialogOpen(false)}
                disabled={generateReport.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={generateReport.isPending}
              >
                {generateReport.isPending ? (
                  <>
                    <Loader className='h-4 w-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  'Generate Report'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* View Report Dialog — Fix 9+10+11+12: uses real API data */}
        <Dialog
          open={viewDialogOpen}
          onOpenChange={v => {
            setViewDialogOpen(v);
            if (!v) setViewReportId(null);
          }}
        >
          <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{reportDetail?.name ?? 'Loading...'}</DialogTitle>
              <DialogDescription>
                Report Details — Generated on{' '}
                {/* Fix 11: generatedAt is ISO string — wrap with new Date() */}
                {reportDetail
                  ? formatDateTime(new Date(reportDetail.generatedAt))
                  : ''}
              </DialogDescription>
            </DialogHeader>
            {isLoadingDetail ? (
              <div className='flex items-center justify-center h-48'>
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
              </div>
            ) : reportDetail ? (
              <div className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Report Type</p>
                    {/* Fix 13: was report.type → reportDetail.reportType */}
                    <p className='font-medium text-gray-900'>
                      {TYPE_LABELS[reportDetail.reportType]}
                    </p>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Status</p>
                    <Badge className={STATUS_COLORS[reportDetail.status]}>
                      {STATUS_LABELS[reportDetail.status]}
                    </Badge>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Period</p>
                    <p className='font-medium text-gray-900'>
                      {reportDetail.periodLabel ?? '—'}
                    </p>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>
                      Records Analyzed
                    </p>
                    {/* Fix 16: was report.recordCount — now reportDetail.recordCount */}
                    <p className='font-medium text-gray-900'>
                      {reportDetail.recordCount.toLocaleString()}
                    </p>
                  </Card>
                </div>
                {/* Fix 12: summary_text from backend — was placeholder text */}
                {reportDetail.summaryText && (
                  <Card className='p-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Report Summary
                    </h4>
                    <p className='text-sm text-gray-700'>
                      {reportDetail.summaryText}
                    </p>
                  </Card>
                )}
                {/* Fix 10: key_metrics from backend — was Math.random() */}
                <Card className='p-6'>
                  <h4 className='font-semibold text-gray-900 mb-3'>
                    Key Metrics
                  </h4>
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-blue-600'>
                        {reportDetail.keyMetrics.fraudDetectionRate.toFixed(1)}%
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Fraud Detection Rate
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-green-600'>
                        {formatCurrency(
                          reportDetail.keyMetrics.fraudAmountDetected,
                        )}
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Fraud Amount Detected
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-orange-600'>
                        {reportDetail.keyMetrics.alertCasesGenerated}
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Alert Cases Generated
                      </p>
                    </div>
                  </div>
                </Card>
                {reportDetail.customNotes && (
                  <Card className='p-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>Notes</h4>
                    <p className='text-sm text-gray-700 italic'>
                      {reportDetail.customNotes}
                    </p>
                  </Card>
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setViewDialogOpen(false);
                  setViewReportId(null);
                }}
              >
                Close
              </Button>
              {/* Fix 20: canDownload from backend */}
              <Button
                onClick={() =>
                  reportDetail &&
                  handleDownloadReport({
                    id: reportDetail.id,
                    name: reportDetail.name,
                    canDownload: reportDetail.canDownload,
                  } as any)
                }
                disabled={!reportDetail?.canDownload}
              >
                <Download className='h-4 w-4 mr-2' />
                Download Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Inline helper used in handleDownloadReport — avoids a separate import for one call
async function reportsService_getDownload(id: string) {
  const { reportsService } = await import('@/services/reportsService');
  return reportsService.getDownload(id);
}
