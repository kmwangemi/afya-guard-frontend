'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
    }
  }, []);
  // Don't render dashboard content until authenticated
  if (!isAuthenticated) {
    return null;
  }
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
