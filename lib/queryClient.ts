import { QueryClient } from '@tanstack/react-query';

/**
 * Creates and configures a QueryClient instance with sensible defaults
 * for the SHA Fraud Detection System
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes before marking as stale
        staleTime: 5 * 60 * 1000,
        
        // Keep unused data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        
        // Retry failed requests up to 2 times with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Automatically refetch when window regains focus
        refetchOnWindowFocus: true,
        
        // Automatically refetch when connection is restored
        refetchOnReconnect: true,
        
        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
};
