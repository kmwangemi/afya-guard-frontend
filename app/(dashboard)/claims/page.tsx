"use client";

import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClaimFilters } from "@/components/claims/ClaimFilters";
import { ClaimsTable } from "@/components/claims/ClaimsTable";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Claim, ClaimFilterParams } from "@/types/claim";
import { useClaims } from "@/hooks/queries/useClaims";
import { mockClaimsService } from "@/services/mockClaimsService";
import { Download, FileText, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ClaimsPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ClaimFilterParams>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use React Query hook for claims data
  const { data: claimsResponse, isLoading } = useClaims(filters, page, pageSize);

  const handleFilter = (newFilters: Partial<ClaimFilterParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    delete updatedFilters.page; // Reset to page 1 when filtering
    setFilters(updatedFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({});
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const blob = await mockClaimsService.exportClaims("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `claims-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[v0] Error exporting claims:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a CSV or Excel file",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Success",
        description: `Processed ${uploadedFile.name}. Claims data extracted and imported successfully.`,
      });
      setUploadDialogOpen(false);
      setUploadedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("[v0] Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to process the file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
            <p className="text-gray-600 mt-1">View and manage submitted healthcare claims</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Claims
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </div>
        {/* Filters */}
        <ClaimFilters onFilter={handleFilter} onReset={handleReset} />
        {/* Table */}
        <ClaimsTable
          claims={claimsResponse?.data || []}
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
        {/* Upload Claims Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Claims File</DialogTitle>
              <DialogDescription>
                Upload a CSV or Excel file containing claims data. The system will automatically extract and validate the data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadedFile ? (
                  <div>
                    <FileText className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="font-medium text-gray-900">Drag and drop your file here</p>
                    <p className="text-sm text-gray-600">or</p>
                    <Button
                      variant="link"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      browse to select
                    </Button>
                  </div>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Supported formats:</strong> CSV, XLSX, XLS<br/>
                  <strong>Max file size:</strong> 50 MB<br/>
                  <strong>Required columns:</strong> Claim ID, Patient ID, Provider Code, Amount, Date
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                disabled={isProcessing || !uploadedFile}
              >
                {isProcessing ? "Processing..." : "Upload & Process"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
