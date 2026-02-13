"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClaimFilters } from "@/components/claims/ClaimFilters";
import { ClaimsTable } from "@/components/claims/ClaimsTable";
import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Claim, ClaimFilterParams } from "@/types/claim";
import { PaginatedResponse } from "@/types/common";
import { mockClaimsService } from "@/services/mockClaimsService";
import { Download, FileText } from "lucide-react";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ClaimFilterParams>({});

  const loadClaims = async (currentPage: number = 1, size: number = 25, currentFilters: ClaimFilterParams = {}) => {
    setIsLoading(true);
    try {
      const response = await mockClaimsService.getClaims(
        currentFilters,
        currentPage,
        size
      );

      setClaims(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("[v0] Error loading claims:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims(page, pageSize, filters);
  }, [page, pageSize, filters]);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
            <p className="text-gray-600 mt-1">Manage and review healthcare claims</p>
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
        </div>
        {/* Filters */}
        <ClaimFilters onFilter={handleFilter} onReset={handleReset} />
        {/* Table */}
        <ClaimsTable
          claims={claims}
          onSelectionChange={setSelectedIds}
          isLoading={isLoading}
        />
        {/* Pagination */}
        {!isLoading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={pageSize}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
