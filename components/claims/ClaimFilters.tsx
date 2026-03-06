'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KENYAN_COUNTIES } from '@/lib/constants';
import { claimFilterSchema, ClaimFilterValues } from '@/lib/validations';
import { ClaimFilterParams } from '@/types/claim';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ClaimFiltersProps {
  onFilter: (filters: Partial<ClaimFilterParams>) => void;
  onReset?: () => void;
}

/**
 * Strip empty strings from form values before passing to the parent.
 * ClaimFilterValues allows '' for Select resets (Zod needs a value),
 * but ClaimFilterParams.status is ClaimStatus which has no empty string.
 */
function toFilterParams(values: ClaimFilterValues): Partial<ClaimFilterParams> {
  return {
    ...(values.search ? { search: values.search } : {}),
    ...(values.status ? { status: values.status } : {}),
    ...(values.riskLevel ? { riskLevel: values.riskLevel } : {}),
    ...(values.county ? { county: values.county } : {}),
    ...(values.providerId ? { providerId: values.providerId } : {}),
  };
}

export function ClaimFilters({ onFilter, onReset }: ClaimFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const form = useForm<ClaimFilterValues>({
    resolver: zodResolver(claimFilterSchema),
    defaultValues: {
      search: '',
      status: '',
      riskLevel: '',
      county: '',
    },
  });

  const handleSubmit = (values: ClaimFilterValues) => {
    onFilter(toFilterParams(values));
  };

  const handleReset = () => {
    form.reset();
    onReset?.();
  };

  if (!isExpanded) {
    return (
      <Button
        variant='outline'
        onClick={() => setIsExpanded(true)}
        className='mb-4'
      >
        <Search className='h-4 w-4 mr-2' />
        Show Filters
      </Button>
    );
  }

  return (
    <Card className='p-6 mb-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-semibold text-gray-900'>Filters</h3>
        <Button variant='ghost' size='sm' onClick={() => setIsExpanded(false)}>
          <X className='h-4 w-4' />
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
          {/* Search */}
          <FormField
            control={form.control}
            name='search'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search</FormLabel>
                <FormControl>
                  <Input placeholder='Claim # or provider name...' {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Status */}
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value || 'all'}
                    onValueChange={v => field.onChange(v === 'all' ? '' : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='All statuses' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>All Statuses</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                      <SelectItem value='approved'>Approved</SelectItem>
                      <SelectItem value='rejected'>Rejected</SelectItem>
                      <SelectItem value='flagged'>Flagged</SelectItem>
                      <SelectItem value='under_review'>Under Review</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* Risk Level */}
            <FormField
              control={form.control}
              name='riskLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Level</FormLabel>
                  <Select
                    value={field.value || 'all'}
                    onValueChange={v => field.onChange(v === 'all' ? '' : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='All levels' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>All Levels</SelectItem>
                      <SelectItem value='low'>Low</SelectItem>
                      <SelectItem value='medium'>Medium</SelectItem>
                      <SelectItem value='high'>High</SelectItem>
                      <SelectItem value='critical'>Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            {/* County */}
            <FormField
              control={form.control}
              name='county'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <Select
                    value={field.value || 'all'}
                    onValueChange={v => field.onChange(v === 'all' ? '' : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='All counties' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='all'>All Counties</SelectItem>
                      {KENYAN_COUNTIES.map(county => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <div className='flex gap-2 pt-2'>
            <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
              Apply Filters
            </Button>
            <Button type='button' variant='outline' onClick={handleReset}>
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
