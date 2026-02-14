import { Providers } from '@/components/providers/Providers';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SHA Fraud Detection System',
  description: 'Healthcare fraud detection system for Kenya',
  generator: 'Next.js',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className='font-sans antialiased bg-gray-50'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
