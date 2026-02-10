'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUIStore } from '@/stores/uiStore';
import { Bell, LogOut, Menu, Settings } from 'lucide-react';

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuth();
  return (
    <header className='sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
      <div className='flex items-center justify-between h-16 px-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={toggleSidebar}
          className='lg:hidden'
        >
          <Menu className='w-5 h-5' />
        </Button>
        <div className='flex-1' />
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon'>
            <Bell className='w-5 h-5' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <Settings className='w-5 h-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{user?.full_name}</DropdownMenuItem>
              <DropdownMenuItem>{user?.email}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className='text-red-600'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
