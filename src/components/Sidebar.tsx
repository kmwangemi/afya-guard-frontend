'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import {
  AlertCircle,
  BarChart3,
  FileSearch,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Claims',
    href: '/claims',
    icon: FileText,
  },
  {
    title: 'Providers',
    href: '/providers',
    icon: Users,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: AlertCircle,
  },
  {
    title: 'Investigations',
    href: '/investigations',
    icon: FileSearch,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') setSidebarOpen(false);
          }}
          aria-label='Close sidebar'
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-border bg-background p-4 transition-transform lg:static lg:translate-x-0',
          !sidebarOpen && '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between mb-6 lg:hidden'>
          <div className='flex items-center gap-2'>
            <Shield className='w-6 h-6 text-blue-600' />
            <span className='font-bold text-slate-900'>SHA FDS</span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setSidebarOpen(false)}
          >
            <X className='w-5 h-5' />
          </Button>
        </div>
        {/* Navigation */}
        <nav className='space-y-2'>
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    isActive && 'bg-blue-600 hover:bg-blue-700',
                  )}
                >
                  <Icon className='w-4 h-4' />
                  <span>{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
