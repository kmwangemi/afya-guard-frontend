'use client';

import { ReactNode, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/queryClient';

/**
 * Root providers component that wraps the entire application
 * Provides React Query's QueryClientProvider for server state management
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
