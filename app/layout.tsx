import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

// import { ThemeProvider } from '@/components/providers/theme-provider';
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
        {/* <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        ></ThemeProvider> */}
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          position='bottom-right'
          toastOptions={{
            duration: 5000,
            classNames: {
              success: 'bg-green-600 text-white border-green-700',
              error: 'bg-red-600 text-white border-red-700',
              warning: 'bg-yellow-500 text-black border-yellow-600',
              info: 'bg-blue-600 text-white border-blue-700',
            },
          }}
        />
      </body>
    </html>
  );
}
