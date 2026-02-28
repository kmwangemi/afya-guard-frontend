'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLogout } from '@/hooks/queries/useLogout';
import { getInitials } from '@/lib/helpers';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { LogOut, Menu, Settings, User } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // API returns full_name — use directly
  const fullName = user?.full_name ?? '';

  // API returns roles[] array — show first role
  const primaryRole = user?.roles?.[0] ?? '';

  return (
    <header className='sticky top-0 z-30 border-b border-gray-200 bg-white'>
      <div className='flex h-16 items-center justify-between px-4 lg:px-6'>
        {/* Left — sidebar toggle + logo */}
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSidebar}
            className='lg:hidden'
          >
            <Menu className='h-5 w-5' />
          </Button>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm'>
              SHA
            </div>
            <h1 className='hidden sm:block text-lg font-bold text-gray-900'>
              SHA Fraud Detection
            </h1>
          </div>
        </div>
        {/* Right — user dropdown */}
        <div className='flex items-center gap-4'>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='flex gap-2'>
                  <div className='h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs'>
                    {getInitials(fullName)}
                  </div>
                  <div className='hidden sm:block text-left'>
                    <p className='text-sm font-medium text-gray-900'>
                      {fullName}
                    </p>
                    <p className='text-xs text-gray-500 capitalize'>
                      {primaryRole}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <div className='px-2 py-1.5'>
                  <p className='text-sm font-medium text-gray-900'>
                    {fullName}
                  </p>
                  <p className='text-xs text-gray-500'>{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <Link href='/profile'>
                  <DropdownMenuItem>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <Link href='/settings'>
                  <DropdownMenuItem>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className='text-red-600'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
