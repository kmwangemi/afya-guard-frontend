'use client';

import React from 'react';

// import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter } from 'next/navigation';
// import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  // const router = useRouter();
  // const { isAuthenticated, isLoading } = useAuth();

  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isAuthenticated, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className='flex items-center justify-center min-h-screen'>
  //       <LoadingSpinner size='lg' />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className='flex min-h-screen bg-background'>
      <Sidebar />
      <div className='flex-1 flex flex-col'>
        <Header />
        <main className='flex-1 overflow-auto'>
          <div className='container mx-auto p-4 md:p-6'>{children}</div>
        </main>
      </div>
    </div>
  );
}
