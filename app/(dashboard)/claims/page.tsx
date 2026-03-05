'use client';

import { ClaimFilters } from '@/components/claims/ClaimFilters';
import { ClaimsTable } from '@/components/claims/ClaimsTable';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useClaims } from '@/hooks/queries/useClaims';
import { useToast } from '@/hooks/use-toast';
import { claimsService } from '@/services/claimsService';
import { ClaimFilterParams } from '@/types/claim';
import { useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ClaimsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ClaimFilterParams>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: claimsResponse,
    isLoading,
    isError,
    error,
  } = useClaims(filters, page, pageSize);

  // Fix 1: removed `page: undefined` spread — ClaimFilterParams has no page field
  //         and it caused a TypeScript error. Resetting page is handled separately.
  const handleFilter = (newFilters: Partial<ClaimFilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const blob = await claimsService.exportClaims('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: 'Export started',
        description: 'Your file will download shortly.',
      });
    } catch (err) {
      console.error('[claims] export error:', err);
      toast({
        title: 'Export failed',
        description: 'Could not export claims.',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowed.includes(file.type)) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV or Excel file.',
        variant: 'destructive',
      });
      return;
    }
    setUploadedFile(file);
  };

  const resetUploadDialog = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    setIsProcessing(true);
    try {
      const result = await claimsService.uploadClaims(uploadedFile);
      toast({
        title: 'Upload successful',
        description: `${uploadedFile.name} imported — ${result.imported} claim(s) added.`,
      });
      setUploadDialogOpen(false);
      resetUploadDialog();
      // Fix 2: invalidate the list so newly imported claims appear immediately
      queryClient.invalidateQueries({ queryKey: ['claims', 'list'] });
    } catch (err) {
      console.error('[claims] upload error:', err);
      toast({
        title: 'Upload failed',
        description: 'Could not process the file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Claims</h1>
            <p className='text-gray-600 mt-1'>
              View and manage submitted healthcare claims
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => setUploadDialogOpen(true)}>
              <Upload className='h-4 w-4 mr-2' />
              Upload Claims
            </Button>
            <Button
              className='bg-blue-600 hover:bg-blue-700'
              onClick={handleExport}
            >
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
          </div>
        </div>
        {/* Error state */}
        {isError && (
          <div className='rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800'>
            Failed to load claims:{' '}
            {(error as Error)?.message ?? 'Unknown error'}
          </div>
        )}
        {/* Filters */}
        <ClaimFilters onFilter={handleFilter} onReset={handleReset} />
        {/* Table */}
        <ClaimsTable
          claims={claimsResponse?.data ?? []}
          onSelectionChange={setSelectedIds}
          isLoading={isLoading}
        />
        {/* Pagination */}
        {!isLoading && claimsResponse && (
          <Pagination
            page={page}
            totalPages={claimsResponse.pagination.totalPages}
            onPageChange={setPage}
            total={claimsResponse.pagination.total}
            pageSize={pageSize}
          />
        )}
        {/* Upload Dialog */}
        <Dialog
          open={uploadDialogOpen}
          onOpenChange={open => {
            setUploadDialogOpen(open);
            if (!open) resetUploadDialog(); // clear file when dialog is dismissed
          }}
        >
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Upload Claims File</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file containing claims data. The system
                will automatically extract and validate the data.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv,.xlsx,.xls'
                  onChange={handleFileSelect}
                  className='hidden'
                />
                {uploadedFile ? (
                  <div>
                    <FileText className='h-12 w-12 mx-auto text-blue-600 mb-2' />
                    <p className='font-medium text-gray-900'>
                      {uploadedFile.name}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={resetUploadDialog}
                      className='mt-2 text-blue-600 hover:text-blue-700'
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className='h-12 w-12 mx-auto text-gray-400 mb-2' />
                    <p className='font-medium text-gray-900'>
                      Drag and drop your file here
                    </p>
                    <p className='text-sm text-gray-600'>or</p>
                    <Button
                      variant='link'
                      onClick={() => fileInputRef.current?.click()}
                      className='text-blue-600 hover:text-blue-700'
                    >
                      browse to select
                    </Button>
                  </div>
                )}
              </div>
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <p className='text-sm text-blue-900'>
                  <strong>Supported formats:</strong> CSV, XLSX, XLS
                  <br />
                  <strong>Max file size:</strong> 50 MB
                  <br />
                  <strong>Required columns:</strong> Claim ID, Patient ID,
                  Provider Code, Amount, Date
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setUploadDialogOpen(false);
                  resetUploadDialog();
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={isProcessing || !uploadedFile}
              >
                {isProcessing ? 'Processing...' : 'Upload & Process'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
