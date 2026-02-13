"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountyFraudData } from "@/types/common";
import { formatCurrency, formatPercentage } from "@/lib/helpers";

interface CountyHeatmapProps {
  data: CountyFraudData[];
  isLoading?: boolean;
}

export function CountyHeatmap({ data, isLoading }: CountyHeatmapProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">County Risk Heatmap</h3>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  // Sort by fraud rate descending
  const sorted = [...data].sort((a, b) => b.fraudRate - a.fraudRate).slice(0, 10);

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Top 10 Counties by Fraud Rate</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-semibold">County</TableHead>
              <TableHead className="text-xs font-semibold text-right">Total Claims</TableHead>
              <TableHead className="text-xs font-semibold text-right">Flagged</TableHead>
              <TableHead className="text-xs font-semibold text-right">Fraud Rate</TableHead>
              <TableHead className="text-xs font-semibold text-right">Est. Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((county) => (
              <TableRow key={county.county}>
                <TableCell className="font-medium text-sm text-gray-900">
                  {county.county}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-600">
                  {county.totalClaims.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm text-gray-600">
                  {county.flaggedClaims.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <div
                      className="px-2 py-1 rounded text-sm font-medium"
                      style={{
                        backgroundColor: `rgba(239, 68, 68, ${county.fraudRate * 0.5})`,
                        color: county.fraudRate > 0.08 ? "#7f1d1d" : "#b91c1c",
                      }}
                    >
                      {formatPercentage(county.fraudRate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-gray-900 font-medium">
                  {formatCurrency(county.estimatedAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
