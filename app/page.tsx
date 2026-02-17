'use client';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  useEffect(() => {
    if (checkAuth()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, []);
  return (
    <div className='flex h-screen items-center justify-center'>
      <LoadingSpinner text='Loading...' />
    </div>
  );
}
