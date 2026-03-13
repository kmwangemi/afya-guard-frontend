'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Pagination } from '@/components/shared/Pagination';
import { RiskScoreBadge } from '@/components/shared/RiskScoreBadge';
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
import { useAddProvider, useProviders } from '@/hooks/queries/useProviders';
import { FACILITY_TYPES, KENYAN_COUNTIES } from '@/lib/constants';
import { formatPercentage } from '@/lib/helpers';
import { FacilityType, ProviderFilterParams } from '@/types/provider';
import { Building2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProvidersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState('');
  const [facilityType, setFacilityType] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    shaProviderCode: '', // Fix 10: required field added
    name: '',
    facilityType: '',
    county: '',
    phone: '',
    email: '',
    bedCapacity: '',
  });
  // Fix 11: facilityType is already stored UPPERCASE from the Select values
  const filters: ProviderFilterParams = {};
  if (search) filters.search = search;
  if (county) filters.county = county;
  if (facilityType) filters.facilityType = facilityType as FacilityType;
  if (riskLevel)
    filters.riskLevel = riskLevel as ProviderFilterParams['riskLevel'];
  const { data: providersResponse, isLoading } = useProviders(
    filters,
    page,
    pageSize,
  );
  // Fix 21: replaced mockProvidersService.addProvider with useAddProvider hook
  const addProvider = useAddProvider();
  const handleAddProvider = async () => {
    if (
      !formData.name ||
      !formData.shaProviderCode ||
      !formData.facilityType ||
      !formData.county
    ) {
      toast.error(
        'Provider Name, SHA Code, Facility Type and County are required.',
      );
      return;
    }
    try {
      await addProvider.mutateAsync({
        shaProviderCode: formData.shaProviderCode,
        name: formData.name,
        facilityType: formData.facilityType as FacilityType,
        county: formData.county,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        bedCapacity: formData.bedCapacity
          ? parseInt(formData.bedCapacity)
          : undefined,
      });
      setAddDialogOpen(false);
      setFormData({
        shaProviderCode: '',
        name: '',
        facilityType: '',
        county: '',
        phone: '',
        email: '',
        bedCapacity: '',
      });
      toast.success('Provider added successfully.');
    } catch (err) {
      console.error('[providers] add error:', err);
      toast.error('Failed to add provider.');
    }
  };
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
          <Button
            className='bg-blue-600 hover:bg-blue-700'
            onClick={() => setAddDialogOpen(true)}
          >
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
              value={county || 'all'}
              onValueChange={v => {
                setCounty(v === 'all' ? '' : v);
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
            {/* Fix 11: FACILITY_TYPES must have UPPERCASE values e.g. { value: 'CLINIC', label: 'Clinic' } */}
            <Select
              value={facilityType || 'all'}
              onValueChange={v => {
                setFacilityType(v === 'all' ? '' : v);
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
              value={riskLevel || 'all'}
              onValueChange={v => {
                setRiskLevel(v === 'all' ? '' : v);
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
              ) : !providersResponse?.data?.length ? (
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
                providersResponse.data.map(provider => (
                  <TableRow key={provider.id}>
                    <TableCell className='font-medium'>
                      <div>
                        <p className='text-gray-900'>{provider.name}</p>
                        <p className='text-xs text-gray-500'>
                          {provider.shaProviderCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-700 capitalize'>
                        {provider.facilityType
                          ?.replace(/_/g, ' ')
                          .toLowerCase() ?? 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className='text-gray-700'>
                      {provider.county ?? 'N/A'}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {provider.totalClaims.toLocaleString()}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatPercentage(provider.flaggedPercentage)}
                    </TableCell>
                    <TableCell>
                      <RiskScoreBadge
                        score={provider.riskScore ?? 0}
                        level={provider.riskLevel ?? 'LOW'}
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
        {!isLoading && providersResponse && (
          <Pagination
            page={page}
            totalPages={providersResponse.pagination.totalPages}
            onPageChange={setPage}
            total={providersResponse.pagination.total}
            pageSize={pageSize}
          />
        )}
        {/* Add Provider Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Add New Provider</DialogTitle>
              <DialogDescription>
                Fill in the provider information to register a new healthcare
                facility.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Provider Name *
                  </label>
                  <Input
                    placeholder='Enter provider name'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='mt-1'
                  />
                </div>
                {/* Fix 10: SHA Provider Code is required — added field */}
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    SHA Provider Code *
                  </label>
                  <Input
                    placeholder='E.g., NHF-00001'
                    value={formData.shaProviderCode}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        shaProviderCode: e.target.value,
                      })
                    }
                    className='mt-1'
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Facility Type *
                  </label>
                  <Select
                    value={formData.facilityType}
                    onValueChange={v =>
                      setFormData({ ...formData, facilityType: v })
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Select facility type' />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    County *
                  </label>
                  <Select
                    value={formData.county}
                    onValueChange={v => setFormData({ ...formData, county: v })}
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Select county' />
                    </SelectTrigger>
                    <SelectContent>
                      {KENYAN_COUNTIES.map(c => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Contact Number
                  </label>
                  <Input
                    placeholder='E.g., +254712345678'
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className='mt-1'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Email
                  </label>
                  <Input
                    type='email'
                    placeholder='E.g., info@provider.ke'
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='mt-1'
                  />
                </div>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Bed Capacity
                </label>
                <Input
                  type='number'
                  placeholder='Number of beds'
                  value={formData.bedCapacity}
                  onChange={e =>
                    setFormData({ ...formData, bedCapacity: e.target.value })
                  }
                  className='mt-1'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setAddDialogOpen(false)}
                disabled={addProvider.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProvider}
                disabled={addProvider.isPending}
              >
                {addProvider.isPending ? 'Adding...' : 'Add Provider'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
