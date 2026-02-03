import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Authentication - SHA Fraud Detection',
  description: 'Sign in to SHA Fraud Detection System',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 px-4'>
      <div className='w-full max-w-md'>{children}</div>
    </div>
  );
}
