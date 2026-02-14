# React Query (TanStack Query) Setup Guide

## Overview

This project uses **TanStack React Query v5** for server state management, caching, and synchronization. React Query handles all the complexity of managing server state while you focus on building great UIs.

## Installation

React Query has been installed and configured. To verify:

```bash
npm list @tanstack/react-query
```

## Setup

### 1. Provider Configuration

React Query is automatically wrapped around your entire application via the `Providers` component in `src/components/providers/Providers.tsx`.

The `QueryClient` is configured with sensible defaults in `src/lib/queryClient.ts`:

- **staleTime**: 5 minutes - Data is considered fresh for 5 minutes
- **gcTime**: 10 minutes - Unused data is garbage collected after 10 minutes
- **retry**: 2 attempts with exponential backoff
- **refetchOnWindowFocus**: Automatically refetch when window regains focus
- **refetchOnReconnect**: Automatically refetch when connection is restored

### 2. Layout Integration

The root layout (`app/layout.tsx`) wraps the app with the Providers component:

```tsx
import { Providers } from '@/components/providers/Providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

## Usage

### Generic Query Hooks

#### useApiQuery

For simple GET requests:

```tsx
import { useApiQuery } from '@/hooks/useApiQuery'

function MyComponent() {
  const { data, isLoading, error } = useApiQuery<MyDataType>(
    ['data-key'],
    '/api/endpoint'
  )
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{data}</div>
}
```

#### useApiPaginatedQuery

For paginated GET requests:

```tsx
const { data, isLoading } = useApiPaginatedQuery(
  ['items'],
  '/api/items',
  page,
  pageSize
)
```

### Generic Mutation Hooks

#### usePostMutation

For POST requests:

```tsx
import { usePostMutation } from '@/hooks/useApiMutation'

function MyForm() {
  const mutation = usePostMutation<ResponseType, PayloadType>(
    '/api/endpoint',
    {
      onSuccess: (data) => {
        console.log('Success!', data)
      },
      onError: (error) => {
        console.error('Error!', error)
      },
    }
  )
  
  return (
    <button onClick={() => mutation.mutate({ /* data */ })}>
      Submit
    </button>
  )
}
```

#### usePutMutation, useDeleteMutation

Similar to POST mutation for PUT and DELETE requests.

### Domain-Specific Hooks

#### Claims

```tsx
import { useClaims, useClaimById, useClaimAnalysis } from '@/hooks/queries/useClaims'

// Get paginated claims list with filters
const { data: claims, isLoading } = useClaims(filters, page, pageSize)

// Get single claim
const { data: claim } = useClaimById(claimId)

// Get claim analysis
const { data: analysis } = useClaimAnalysis(claimId)
```

#### Providers

```tsx
import { 
  useProviders, 
  useProviderById, 
  useProviderStatistics,
  useProviderFraudHistory 
} from '@/hooks/queries/useProviders'

// Get paginated providers
const { data: providers } = useProviders(filters, page, pageSize)

// Get single provider
const { data: provider } = useProviderById(providerId)

// Get statistics
const { data: stats } = useProviderStatistics(providerId)

// Get fraud history
const { data: history } = useProviderFraudHistory(providerId)
```

#### Dashboard

```tsx
import { 
  useDashboardStats, 
  useClaimsTrend, 
  useCountyFraudAnalysis,
  useRecentAlerts 
} from '@/hooks/queries/useDashboard'

// Get dashboard statistics
const { data: stats } = useDashboardStats()

// Get claims trend data
const { data: trends } = useClaimsTrend()

// Get county analysis
const { data: counties } = useCountyFraudAnalysis()

// Get recent alerts
const { data: alerts } = useRecentAlerts(10)
```

#### Alerts

```tsx
import { useAlerts, useAlertById } from '@/hooks/queries/useAlerts'

// Get alerts with filters
const { data: alerts } = useAlerts(filters, page, pageSize)

// Get single alert
const { data: alert } = useAlertById(alertId)
```

## Best Practices

### 1. Use Query Keys Consistently

Query keys are arrays that uniquely identify cached data:

```tsx
// Good - hierarchical and filterable
const CLAIMS_QUERY_KEY = 'claims'
useQuery({
  queryKey: [CLAIMS_QUERY_KEY, filters, page],
  // ...
})

// Bad - non-hierarchical
useQuery({
  queryKey: ['my-data-1'],
  // ...
})
```

### 2. Invalidate Queries After Mutations

When data changes, invalidate relevant queries:

```tsx
const mutation = usePostMutation('/claims/approve', {
  onSuccess: () => {
    // Refetch claims list after successful mutation
    queryClient.invalidateQueries({
      queryKey: ['claims'],
    })
  },
})
```

### 3. Combine Data from Multiple Queries

```tsx
function ClaimDetail({ claimId }) {
  const { data: claim } = useClaimById(claimId)
  const { data: analysis } = useClaimAnalysis(claimId)
  
  return (
    <div>
      <h1>{claim?.id}</h1>
      <p>Risk: {analysis?.riskScore}</p>
    </div>
  )
}
```

### 4. Handle Loading and Error States

```tsx
function MyComponent() {
  const { data, isLoading, error, isFetching } = useQuery(...)
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (isFetching) return <div>Updating...</div>
  
  return <div>{data}</div>
}
```

### 5. Refetch Intervals for Real-Time Data

For dashboard or alert data, enable auto-refresh:

```tsx
useQuery({
  queryKey: ['alerts'],
  queryFn: () => fetchAlerts(),
  refetchInterval: 30 * 1000, // Refresh every 30 seconds
})
```

## API Integration

When connecting to a real backend:

1. Update mock services with actual API calls
2. Keep the same hook interfaces - no component changes needed
3. The caching and retry logic automatically applies

Example:

```tsx
// Before (mock)
export function useClaims(filters, page, pageSize) {
  return useQuery({
    queryKey: ['claims', filters, page, pageSize],
    queryFn: () => mockClaimsService.getClaims(filters, page, pageSize),
  })
}

// After (real API)
export function useClaims(filters, page, pageSize) {
  return useQuery({
    queryKey: ['claims', filters, page, pageSize],
    queryFn: () => api.get('/claims', { params: { filters, page, pageSize } }),
  })
}

// Components remain unchanged!
```

## Dev Tools

Enable React Query DevTools for debugging (optional):

```bash
npm install @tanstack/react-query-devtools
```

Then add to your layout:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

## Configuration Details

See `src/lib/queryClient.ts` for complete configuration. Key settings:

- **Stale Time**: How long data is considered fresh
- **GC Time**: How long to keep unused data in cache
- **Retry**: Number of retry attempts and backoff strategy
- **Refetch Behavior**: What triggers automatic refetching

## Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [React Query Examples](https://github.com/TanStack/query/tree/main/examples)
- [API Reference](https://tanstack.com/query/latest/docs/react/reference)
