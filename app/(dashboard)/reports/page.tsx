'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { useToast } from '@/hooks/use-toast';
import { formatDateTime } from '@/lib/helpers';
import { Download, Eye, FileText, Loader, Plus } from 'lucide-react';
import { useState } from 'react';

const mockReports = [
  {
    id: 'rpt_001',
    name: 'Weekly Fraud Summary',
    type: 'summary',
    period: '2024-02-05 to 2024-02-11',
    status: 'completed',
    generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    recordCount: 1250,
  },
  {
    id: 'rpt_002',
    name: 'Provider Risk Analysis',
    type: 'provider',
    period: '2024-01-01 to 2024-02-11',
    status: 'completed',
    generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    recordCount: 456,
  },
  {
    id: 'rpt_003',
    name: 'Investigation Outcomes',
    type: 'investigation',
    period: '2024-01-01 to 2024-02-11',
    status: 'processing',
    generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    recordCount: 0,
  },
  {
    id: 'rpt_004',
    name: 'County-wise Fraud Statistics',
    type: 'county',
    period: '2024-02-01 to 2024-02-11',
    status: 'completed',
    generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    recordCount: 890,
  },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState(mockReports);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<
    (typeof mockReports)[0] | null
  >(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationForm, setGenerationForm] = useState({
    name: '',
    type: '',
    dateRange: 'month',
    customNotes: '',
  });

  const filteredReports = reports.filter(report => {
    if (reportType && reportType !== 'all' && report.type !== reportType)
      return false;
    if (search && !report.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  const handleGenerateReport = async () => {
    if (!generationForm.name || !generationForm.type) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newReport = {
        id: `rpt_${Date.now()}`,
        name: generationForm.name,
        type: generationForm.type,
        period: `Generated on ${new Date().toLocaleDateString()}`,
        status: 'completed' as const,
        generatedAt: new Date(),
        recordCount: Math.floor(Math.random() * 5000) + 100,
      };

      setReports([newReport, ...reports]);
      setGenerateDialogOpen(false);
      setGenerationForm({
        name: '',
        type: '',
        dateRange: 'month',
        customNotes: '',
      });

      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
    } catch (error) {
      console.error('[v0] Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (report: (typeof mockReports)[0]) => {
    setSelectedReport(report);
    setViewDialogOpen(true);
  };

  const handleDownloadReport = (report: (typeof mockReports)[0]) => {
    if (report.status !== 'completed') {
      toast({
        title: 'Info',
        description: 'Report is still processing. Please try again later.',
      });
      return;
    }

    const reportData = {
      name: report.name,
      type: report.type,
      period: report.period,
      generatedAt: report.generatedAt.toISOString(),
      recordCount: report.recordCount,
      status: report.status,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: `Downloaded ${report.name}`,
    });
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
        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Total Reports</p>
            <p className='text-2xl font-bold text-gray-900'>
              {mockReports.length}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Completed</p>
            <p className='text-2xl font-bold text-green-600'>
              {mockReports.filter(r => r.status === 'completed').length}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Processing</p>
            <p className='text-2xl font-bold text-blue-600'>
              {mockReports.filter(r => r.status === 'processing').length}
            </p>
          </Card>
          <Card className='p-4'>
            <p className='text-sm text-gray-600 mb-1'>Total Records</p>
            <p className='text-2xl font-bold text-gray-900'>
              {mockReports
                .reduce((sum, r) => sum + r.recordCount, 0)
                .toLocaleString()}
            </p>
          </Card>
        </div>
        {/* Filters */}
        <Card className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Input
              placeholder='Search reports...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              value={reportType || 'all'}
              onValueChange={v => setReportType(v === 'all' ? '' : v)}
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
              {filteredReports.length === 0 ? (
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
                filteredReports.map(report => (
                  <TableRow key={report.id} className='hover:bg-gray-50'>
                    <TableCell className='font-medium text-gray-900'>
                      {report.name}
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-700 capitalize'>
                        {report.type}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm text-gray-700'>
                      {report.period}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[report.status]}>
                        {report.status.charAt(0).toUpperCase() +
                          report.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {report.recordCount.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-sm text-gray-600'>
                      {formatDateTime(report.generatedAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex gap-2 justify-end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          disabled={report.status !== 'completed'}
                          onClick={() => handleDownloadReport(report)}
                          title={
                            report.status !== 'completed'
                              ? 'Report must be completed to download'
                              : 'Download report'
                          }
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        {/* Generate Report Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Create a new fraud detection report with custom parameters and
                analysis
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
                    value={generationForm.type}
                    onValueChange={v =>
                      setGenerationForm({ ...generationForm, type: v })
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
                    value={generationForm.dateRange}
                    onValueChange={v =>
                      setGenerationForm({ ...generationForm, dateRange: v })
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
                  seconds to 2 minutes depending on the data volume and report
                  complexity.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setGenerateDialogOpen(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={isGenerating}>
                {isGenerating ? (
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
        {/* View Report Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>{selectedReport?.name}</DialogTitle>
              <DialogDescription>
                Report Details - Generated on{' '}
                {selectedReport
                  ? formatDateTime(selectedReport.generatedAt)
                  : ''}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Report Type</p>
                    <p className='font-medium text-gray-900 capitalize'>
                      {selectedReport.type}
                    </p>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Status</p>
                    <Badge className={statusColors[selectedReport.status]}>
                      {selectedReport.status.charAt(0).toUpperCase() +
                        selectedReport.status.slice(1)}
                    </Badge>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>Period</p>
                    <p className='font-medium text-gray-900'>
                      {selectedReport.period}
                    </p>
                  </Card>
                  <Card className='p-4'>
                    <p className='text-sm text-gray-600 mb-1'>
                      Records Analyzed
                    </p>
                    <p className='font-medium text-gray-900'>
                      {selectedReport.recordCount.toLocaleString()}
                    </p>
                  </Card>
                </div>
                <Card className='p-6'>
                  <h4 className='font-semibold text-gray-900 mb-3'>
                    Report Summary
                  </h4>
                  <div className='space-y-2 text-sm text-gray-700'>
                    <p>
                      This is a {selectedReport.type} report containing analysis
                      of {selectedReport.recordCount.toLocaleString()} records.
                    </p>
                    <p>The report covers the period: {selectedReport.period}</p>
                    <p>
                      Generated on:{' '}
                      {selectedReport.generatedAt.toLocaleDateString()} at{' '}
                      {selectedReport.generatedAt.toLocaleTimeString()}
                    </p>
                  </div>
                </Card>
                <Card className='p-6'>
                  <h4 className='font-semibold text-gray-900 mb-3'>
                    Key Metrics
                  </h4>
                  <div className='grid grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-blue-600'>
                        {(Math.random() * 15 + 5).toFixed(1)}%
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Fraud Detection Rate
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-green-600'>
                        {(Math.random() * 20000 + 50000).toLocaleString()}
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Fraud Amount Detected
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-orange-600'>
                        {Math.floor(Math.random() * 100 + 20)}
                      </p>
                      <p className='text-xs text-gray-600 mt-1'>
                        Alert Cases Generated
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setViewDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (selectedReport) {
                    handleDownloadReport(selectedReport);
                  }
                }}
                disabled={selectedReport?.status !== 'completed'}
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
