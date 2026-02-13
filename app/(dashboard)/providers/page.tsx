'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { FACILITY_TYPES, KENYAN_COUNTIES } from '@/lib/constants';
import { formatPercentage } from '@/lib/helpers';
import { mockProvidersService } from '@/services/mockProvidersService';
import { Provider, ProviderFilterParams } from '@/types/provider';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('all'); // Changed from ""
  const [facilityType, setFacilityType] = useState('all'); // Changed from ""
  const [riskLevel, setRiskLevel] = useState('all'); // Changed from ""

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const filters: ProviderFilterParams = {};
      if (search) filters.search = search;
      if (county && county !== 'all') filters.county = county; // Added check
      if (facilityType && facilityType !== 'all')
        filters.facilityType = facilityType as any; // Added check
      if (riskLevel && riskLevel !== 'all')
        filters.riskLevel = riskLevel as any; // Added check

      const response = await mockProvidersService.getProviders(
        filters,
        page,
        pageSize,
      );
      setProviders(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('[v0] Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [page, pageSize, search, county, facilityType, riskLevel]);

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Providers</h1>
            <p className='text-gray-600 mt-1'>
              Healthcare facility management and risk assessment
            </p>
          </div>
          <Button className='bg-blue-600 hover:bg-blue-700'>
            <Plus className='h-4 w-4 mr-2' />
            Add Provider
          </Button>
        </div>
        {/* Filters */}
        <Card className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <Input
              placeholder='Search by name or code...'
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={county}
              onValueChange={v => {
                setCounty(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All counties' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Counties</SelectItem>
                {KENYAN_COUNTIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={facilityType}
              onValueChange={v => {
                setFacilityType(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All facility types' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Types</SelectItem>
                {FACILITY_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={riskLevel}
              onValueChange={v => {
                setRiskLevel(v);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='All risk levels' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Levels</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
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
        {/* Table */}
        <Card className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gray-50'>
                <TableHead className='font-semibold'>Provider</TableHead>
                <TableHead className='font-semibold'>Facility Type</TableHead>
                <TableHead className='font-semibold'>County</TableHead>
                <TableHead className='font-semibold text-right'>
                  Total Claims
                </TableHead>
                <TableHead className='font-semibold text-right'>
                  Flagged %
                </TableHead>
                <TableHead className='font-semibold'>Risk Score</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-20 text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' />
                      Loading providers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : providers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='h-20 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <Building2 className='h-8 w-8 text-gray-300' />
                      No providers found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                providers.map(provider => (
                  <TableRow key={provider.id}>
                    <TableCell className='font-medium'>
                      <div>
                        <p className='text-gray-900'>{provider.name}</p>
                        <p className='text-xs text-gray-500'>{provider.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-700 capitalize'>
                        {provider.facilityType}
                      </span>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {provider.countyName}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {provider.statistics.totalClaims.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatPercentage(provider.statistics.flaggedPercentage)}
                    </TableCell>
                    <TableCell>
                      <RiskScoreBadge
                        score={provider.riskScore}
                        level={provider.riskLevel}
                        size='sm'
                      />
                    </TableCell>
                    <TableCell className='text-right'>
                      <Link
                        href={`/providers/${provider.id}`}
                        className='text-blue-600 hover:text-blue-700 text-sm font-medium'
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
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
