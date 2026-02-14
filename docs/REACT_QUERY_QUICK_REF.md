# React Query Quick Reference

## Installation

```bash
npm install @tanstack/react-query
```

## Basic Setup (Already Done!)

The app is already set up with React Query. All you need to do is use the hooks!

## Query Hooks

### Fetch Claims
```tsx
import { useClaims, useClaimById, useClaimAnalysis } from '@/hooks/queries/useClaims'

// Get list with pagination
const { data, isLoading, error } = useClaims(filters, page, pageSize)

// Get single item
const { data: claim } = useClaimById(claimId)

// Get analysis
const { data: analysis } = useClaimAnalysis(claimId)
```

### Fetch Providers
```tsx
import { useProviders, useProviderById } from '@/hooks/queries/useProviders'

const { data: providers } = useProviders(filters, page, pageSize)
const { data: provider } = useProviderById(providerId)
```

### Fetch Dashboard
```tsx
import { useDashboardStats, useClaimsTrend, useRecentAlerts } from '@/hooks/queries/useDashboard'

const { data: stats } = useDashboardStats()
const { data: trends } = useClaimsTrend()
const { data: alerts } = useRecentAlerts(limit)
```

## Mutation Hooks

### Update Claim
```tsx
import { useUpdateClaimStatus, useFlagClaimForInvestigation } from '@/hooks/queries/useClaims'

const mutation = useUpdateClaimStatus()

mutation.mutate(
  { claimId: 'ABC123', status: 'approved' },
  {
    onSuccess: () => console.log('Done!'),
    onError: (error) => console.error(error),
  }
)

// While loading
{mutation.isPending && <span>Loading...</span>}

// Display error
{mutation.error && <span>Error: {mutation.error.message}</span>}
```

### Suspend Provider
```tsx
import { useSuspendProvider } from '@/hooks/queries/useProviders'

const mutation = useSuspendProvider()
mutation.mutate({ providerId: 'P123', reason: 'High fraud rate' })
```

## Query Client Operations

### Invalidate Queries (Force Refetch)
```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Invalidate all claims queries
queryClient.invalidateQueries({
  queryKey: ['claims'],
})

// Invalidate specific claim
queryClient.invalidateQueries({
  queryKey: ['claims', claimId],
})

// Invalidate dashboard stats
queryClient.invalidateQueries({
  queryKey: ['dashboard', 'stats'],
})
```

### Manually Set Data
```tsx
queryClient.setQueryData(['claims', claimId], updatedClaim)
```

### Clear All Cache
```tsx
queryClient.clear()
```

## Loading States

```tsx
const { isLoading, isFetching, isPending } = useQuery(...)

// isLoading: First time data is loading
// isFetching: Any time a request is in flight
// isPending: Same as isLoading for mutations
```

## Common Patterns

### Show Loading Spinner
```tsx
const { isLoading } = useClaims(filters, page, pageSize)

{isLoading ? <LoadingSpinner /> : <ClaimsTable />}
```

### Handle Pagination
```tsx
const [page, setPage] = useState(1)
const { data: response } = useClaims(filters, page, 25)

<button onClick={() => setPage(p => p - 1)}>Previous</button>
<span>Page {page} of {response?.pagination.totalPages}</span>
<button onClick={() => setPage(p => p + 1)}>Next</button>
```

### Filter and Search
```tsx
const [search, setSearch] = useState('')
const filters = { search }

const { data } = useClaims(filters, 1, 25)

// When user types, React Query automatically refetches!
```

### Combine Multiple Queries
```tsx
const { data: claim } = useClaimById(claimId)
const { data: provider } = useProviderById(providerId)
const { data: analysis } = useClaimAnalysis(claimId)

// All cached and managed independently
```

### Refresh Data
```tsx
const { refetch } = useClaims(filters, page, pageSize)

<button onClick={() => refetch()}>Refresh</button>
```

### Success/Error Notifications
```tsx
const mutation = useUpdateClaimStatus()

mutation.mutate(data, {
  onSuccess: () => {
    toast.success('Claim approved!')
  },
  onError: (error) => {
    toast.error(`Error: ${error.message}`)
  },
})
```

## Caching Behavior

Default times (can be customized per hook):
- **Stale Time**: 5 minutes
- **GC Time**: 10 minutes
- **Auto-refetch**: On window focus, reconnect

Data stays fresh for 5 min, then marked stale. Background refetch triggers when:
- Window regains focus
- Connection reconnects
- Mutation invalidates queries
- Time interval elapses (dashboard: 1 min)

## File Locations

| Purpose | Location |
|---------|----------|
| Config | `src/lib/queryClient.ts` |
| Provider | `src/components/providers/Providers.tsx` |
| Claims Hooks | `src/hooks/queries/useClaims.ts` |
| Providers Hooks | `src/hooks/queries/useProviders.ts` |
| Dashboard Hooks | `src/hooks/queries/useDashboard.ts` |
| Alerts Hooks | `src/hooks/queries/useAlerts.ts` |

## Debugging

### React Query DevTools (Optional)
```bash
npm install @tanstack/react-query-devtools
```

Then in `Providers.tsx`:
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

Opens DevTools in the bottom right of your app showing:
- All active queries
- Query history
- Cache explorer
- Real-time updates

## Common Mistakes to Avoid

❌ **Don't** refetch in useEffect:
```tsx
useEffect(() => {
  loadClaims() // ❌ Wrong
}, [])
```

✅ **Do** use the hook directly:
```tsx
const { data } = useClaims(filters, page, pageSize) // ✅ Correct
```

❌ **Don't** manually manage loading:
```tsx
const [isLoading, setIsLoading] = useState(true) // ❌ Not needed
```

✅ **Do** let React Query manage it:
```tsx
const { isLoading } = useClaims(...) // ✅ Automatic
```

❌ **Don't** forget to invalidate after mutations:
```tsx
mutation.mutate(data) // ❌ Cache won't update
```

✅ **Do** invalidate related queries:
```tsx
mutation.mutate(data, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['claims'] }) // ✅
  },
})
```

## Performance Tips

1. **Use selective invalidation**
   ```tsx
   // Good - only invalidate what changed
   queryClient.invalidateQueries({ queryKey: ['claims'] })
   
   // Bad - invalidates everything
   queryClient.clear()
   ```

2. **Enable query deduplication**
   - React Query automatically dedupes identical requests made simultaneously

3. **Use pagination over infinite scroll** (when possible)
   - Easier to manage memory and performance

4. **Set appropriate staleTime**
   - Higher = less refetch requests
   - Lower = more up-to-date data

5. **Prefetch data**
   ```tsx
   queryClient.prefetchQuery({
     queryKey: ['claims', 2],
     queryFn: () => fetchClaims({}, 2, 25),
   })
   ```

## Need More Help?

- Full Guide: `docs/REACT_QUERY_SETUP.md`
- Examples: `docs/REACT_QUERY_EXAMPLES.md`
- Official Docs: https://tanstack.com/query/latest

That's it! Happy querying! 🚀
