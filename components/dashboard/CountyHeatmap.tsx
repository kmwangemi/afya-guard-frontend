'use client';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatPercentage } from '@/lib/helpers';
import { CountyFraudData } from '@/types/common';

interface CountyHeatmapProps {
  data: CountyFraudData[];
  isLoading?: boolean;
}

export function CountyHeatmap({ data, isLoading }: CountyHeatmapProps) {
  if (isLoading) {
    return (
      <Card className='p-6'>
        <h3 className='font-semibold text-gray-900 mb-4'>
          Top 10 Counties by Fraud Rate
        </h3>
        <div className='space-y-2'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-12 bg-gray-100 rounded animate-pulse' />
          ))}
        </div>
      </Card>
    );
  }
  // Backend already returns rows sorted by fraud_rate DESC and limited to `limit`
  // (GET /dashboard/counties?limit=10). No client-side sort or slice needed.
  const rows = data;
  return (
    <Card className='p-6'>
      <h3 className='font-semibold text-gray-900 mb-4'>
        Top 10 Counties by Fraud Rate
      </h3>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-xs font-semibold'>County</TableHead>
              <TableHead className='text-xs font-semibold text-right'>
                Total Claims
              </TableHead>
              <TableHead className='text-xs font-semibold text-right'>
                Flagged
              </TableHead>
              <TableHead className='text-xs font-semibold text-right'>
                Fraud Rate
              </TableHead>
              <TableHead className='text-xs font-semibold text-right'>
                Est. Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center text-sm text-gray-500 py-8'
                >
                  No county data available
                </TableCell>
              </TableRow>
            ) : (
              rows.map(county => (
                <TableRow key={county.county}>
                  <TableCell className='font-medium text-sm text-gray-900'>
                    {county.county}
                  </TableCell>
                  <TableCell className='text-right text-sm text-gray-600'>
                    {county.totalClaims.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-right text-sm text-gray-600'>
                    {county.flaggedClaims.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end'>
                      <div
                        className='px-2 py-1 rounded text-sm font-medium'
                        style={{
                          backgroundColor: `rgba(239, 68, 68, ${county.fraudRate * 0.5})`,
                          color:
                            county.fraudRate > 0.08 ? '#7f1d1d' : '#b91c1c',
                        }}
                      >
                        {formatPercentage(county.fraudRate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='text-right text-sm text-gray-900 font-medium'>
                    {formatCurrency(county.estimatedAmount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
