'use client';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const { token, hasHydrated } = useAuthStore();
  useEffect(() => {
    if (!hasHydrated) return;
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [token, hasHydrated, router]);
  return (
    <div className='flex h-screen items-center justify-center'>
      <LoadingSpinner text='Loading...' />
    </div>
  );
}
