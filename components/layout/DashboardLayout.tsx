'use client';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace('/login');
    }
  }, [token, hasHydrated, router]);
  if (!hasHydrated) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-50'>
        <LoadingSpinner text='Loading...' />
      </div>
    );
  }
  // Don't render dashboard content until authenticated
  if (!token) return null;
  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      <Header />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 overflow-auto'>
          <div className='container mx-auto max-w-7xl p-4 lg:p-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
