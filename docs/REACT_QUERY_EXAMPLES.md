# React Query Usage Examples

## Common Patterns

### 1. Basic Query Hook

Fetch and display a list of items with loading and error states:

```tsx
import { useClaims } from '@/hooks/queries/useClaims'

export function ClaimsList() {
  const { data: response, isLoading, error } = useClaims({}, 1, 25)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {response?.data.map((claim) => (
        <li key={claim.id}>{claim.id}</li>
      ))}
    </ul>
  )
}
```

### 2. Combining Multiple Queries

Fetch related data from multiple endpoints:

```tsx
import { useClaimById } from '@/hooks/queries/useClaims'
import { useProviderById } from '@/hooks/queries/useProviders'

export function ClaimDetail({ claimId, providerId }: Props) {
  const { data: claim, isLoading: claimLoading } = useClaimById(claimId)
  const { data: provider, isLoading: providerLoading } = useProviderById(providerId)

  const isLoading = claimLoading || providerLoading

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Claim: {claim?.id}</h1>
      <p>Provider: {provider?.name}</p>
    </div>
  )
}
```

### 3. Pagination

Handle paginated data fetching:

```tsx
import { useClaims } from '@/hooks/queries/useClaims'
import { useState } from 'react'

export function ClaimsWithPagination() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)

  const { data: response, isLoading } = useClaims({}, page, pageSize)

  return (
    <div>
      <table>
        <tbody>
          {response?.data.map((claim) => (
            <tr key={claim.id}>
              <td>{claim.id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {response?.pagination.totalPages}</span>
        <button 
          onClick={() => setPage(p => p + 1)} 
          disabled={page === response?.pagination.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

### 4. Filtering and Searching

Update filters and refetch data:

```tsx
import { useClaims } from '@/hooks/queries/useClaims'
import { useState } from 'react'
import { ClaimFilterParams } from '@/types/claim'

export function FilteredClaims() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ClaimFilterParams>({})

  const { data: response } = useClaims(filters, page, 25)

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm })
    setPage(1) // Reset to first page
  }

  const handleRiskFilter = (risk: string) => {
    setFilters({ ...filters, riskLevel: risk })
    setPage(1)
  }

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      <select onChange={(e) => handleRiskFilter(e.target.value)}>
        <option value="">All Risk Levels</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Display results */}
    </div>
  )
}
```

### 5. Mutations (Creating/Updating Data)

Create or update data and refetch queries:

```tsx
import { useUpdateClaimStatus } from '@/hooks/queries/useClaims'

export function ApproveClaimButton({ claimId }: { claimId: string }) {
  const mutation = useUpdateClaimStatus()

  const handleApprove = () => {
    mutation.mutate(
      { claimId, status: 'approved' },
      {
        onSuccess: () => {
          console.log('Claim approved!')
        },
        onError: (error) => {
          console.error('Failed to approve:', error)
        },
      }
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Approving...' : 'Approve'}
    </button>
  )
}
```

### 6. Optimistic Updates

Update UI immediately while request is in flight:

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateClaimStatus } from '@/hooks/queries/useClaims'
import { Claim } from '@/types/claim'

export function ApproveWithOptimism({ claim }: { claim: Claim }) {
  const queryClient = useQueryClient()
  const mutation = useUpdateClaimStatus()

  const handleApprove = () => {
    // Optimistically update the cache
    queryClient.setQueryData(['claims', claim.id], {
      ...claim,
      status: 'approved',
    })

    // Make the request
    mutation.mutate(
      { claimId: claim.id, status: 'approved' },
      {
        onError: () => {
          // Revert on error
          queryClient.invalidateQueries({
            queryKey: ['claims', claim.id],
          })
        },
      }
    )
  }

  return <button onClick={handleApprove}>Approve</button>
}
```

### 7. Dependent Queries

Only fetch data when certain conditions are met:

```tsx
import { useClaimAnalysis } from '@/hooks/queries/useClaims'

export function ClaimAnalysis({ claimId }: { claimId?: string }) {
  // This query won't execute until claimId is provided
  const { data: analysis } = useClaimAnalysis(claimId || '')

  if (!claimId) return <div>Select a claim first</div>

  return <div>Risk Score: {analysis?.riskScore}</div>
}
```

### 8. Real-Time Dashboard

Auto-refreshing dashboard with latest stats:

```tsx
import { useDashboardStats, useRecentAlerts } from '@/hooks/queries/useDashboard'

export function RealtimeDashboard() {
  const { data: stats, dataUpdatedAt } = useDashboardStats()
  const { data: alerts } = useRecentAlerts(5)

  return (
    <div>
      <div>Total Claims: {stats?.totalClaimsProcessed}</div>
      <div>Last updated: {new Date(dataUpdatedAt || 0).toLocaleTimeString()}</div>

      <h3>Recent Alerts</h3>
      <ul>
        {alerts?.map((alert) => (
          <li key={alert.id}>{alert.message}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 9. Batch Operations

Perform multiple mutations in sequence:

```tsx
import { useUpdateClaimStatus } from '@/hooks/queries/useClaims'

export function BatchApprove({ claimIds }: { claimIds: string[] }) {
  const mutation = useUpdateClaimStatus()

  const handleApproveAll = async () => {
    for (const claimId of claimIds) {
      await new Promise((resolve) => {
        mutation.mutate(
          { claimId, status: 'approved' },
          {
            onSuccess: resolve,
            onError: resolve, // Continue even if one fails
          }
        )
      })
    }
  }

  return (
    <button onClick={handleApproveAll} disabled={mutation.isPending}>
      Approve All ({claimIds.length})
    </button>
  )
}
```

### 10. Error Handling

Handle different types of errors:

```tsx
import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export function ClaimsWithErrorHandling() {
  const { data, error, isError } = useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const response = await fetch('/api/claims')
      if (!response.ok) throw new Error('Failed to fetch')
      return response.json()
    },
  })

  if (isError) {
    const axiosError = error as AxiosError
    if (axiosError?.response?.status === 403) {
      return <div>You don't have permission to view claims</div>
    }
    if (axiosError?.response?.status === 404) {
      return <div>Claims not found</div>
    }
    return <div>Error: {error?.message}</div>
  }

  return <div>{/* render claims */}</div>
}
```

## Advanced Patterns

### Custom Hook with Additional Logic

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useClaimsWithStats(filters: any, page: number) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['claims', filters, page],
    queryFn: async () => {
      // Custom logic here
      const data = await fetchClaims(filters, page)
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  const prefetchNextPage = () => {
    queryClient.prefetchQuery({
      queryKey: ['claims', filters, page + 1],
      queryFn: () => fetchClaims(filters, page + 1),
    })
  }

  return { ...query, prefetchNextPage }
}
```

### Infinite Query (for infinite scrolling)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

export function InfiniteClaimsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['claims', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchClaims({}, pageParam, 25),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  })

  return (
    <div>
      {data?.pages.map((page) =>
        page.data.map((claim) => <div key={claim.id}>{claim.id}</div>)
      )}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </button>
    </div>
  )
}
```

## Testing with React Query

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('ClaimsList', () => {
  it('renders claims', () => {
    render(<ClaimsList />, { wrapper: TestWrapper })
    expect(screen.getByText(/claims/i)).toBeInTheDocument()
  })
})
```

These examples cover the most common patterns you'll use in the application!
