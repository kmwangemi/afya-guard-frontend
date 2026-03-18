"use client";

import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, maskPatientId } from "@/lib/helpers";
import { Claim } from "@/types/claim";
import { FileX } from 'lucide-react';
import Link from "next/link";

interface ClaimsTableProps {
  claims: Claim[];
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
}

export function ClaimsTable({ claims, onSelectionChange, isLoading }: ClaimsTableProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    const newSelectedIds = checked ? claims.map((c) => c.id) : [];
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, id]
      : selectedIds.filter((sid) => sid !== id);
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (claims.length === 0) {
    return (
      <div className='border border-gray-200 rounded-lg overflow-hidden'>
        <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
          <div className='bg-gray-100 rounded-full p-4 mb-4'>
            <FileX className='w-8 h-8 text-gray-400' />
          </div>
          <h3 className='text-base font-semibold text-gray-900 mb-1'>
            No claims found
          </h3>
          <p className='text-sm text-gray-500 max-w-sm'>
            There are no claims matching your current filters. Try adjusting
            your search or filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === claims.length && claims.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold">Claim #</TableHead>
            <TableHead className="font-semibold">Provider</TableHead>
            <TableHead className="font-semibold">Patient ID</TableHead>
            <TableHead className="font-semibold text-right">Amount</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Risk Score</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {claims.map((claim) => (
            <TableRow
              key={claim.id}
              className={selectedIds.includes(claim.id) ? "bg-blue-50" : ""}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(claim.id)}
                  onCheckedChange={(checked) => handleSelectRow(claim.id, !!checked)}
                />
              </TableCell>
              <TableCell className="font-medium text-gray-900">
                <Link
                  href={`/claims/${claim.id}`}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {claim.claimNumber}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {claim.providerName}
              </TableCell>
              <TableCell className="text-sm text-gray-600 font-mono">
                {maskPatientId(claim.patientId)}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {formatCurrency(claim.amount)}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {formatDate(claim.serviceDateStart)}
              </TableCell>
              <TableCell>
                <RiskScoreBadge score={claim.riskScore} level={claim.riskLevel} size="sm" />
              </TableCell>
              <TableCell>
                <StatusBadge status={claim.status} type="claim" size="sm" />
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/claims/${claim.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import React from "react";
