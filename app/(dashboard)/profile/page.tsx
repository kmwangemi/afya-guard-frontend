'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLogout } from '@/hooks/queries/useLogout';
import { capitalizeFirstLetter } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  Briefcase,
  Calendar,
  Clock,
  Edit,
  LogOut,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // API returns full_name — split for display only
  const fullName = user?.full_name ?? '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') ?? '';

  // API returns roles[] — show first role
  const primaryRole = user?.roles?.[0] ?? '';

  const stats = [
    { label: 'Cases Investigated', value: '47' },
    { label: 'Alerts Reviewed', value: '1,248' },
    { label: 'Fraud Cases Confirmed', value: '12' },
    { label: 'Total Fraud Amount Recovered', value: 'KES 2.4M' },
  ];

  return (
    <DashboardLayout>
      <div className='max-w-4xl space-y-6'>
        {/* Profile Header */}
        <Card className='p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-6'>
              {/* Avatar — initials fallback if no picture */}
              <div className='h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
                {user?.full_name
                  ? user.full_name
                      .trim()
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '??'}
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {capitalizeFirstLetter(firstName)}{' '}
                  {capitalizeFirstLetter(lastName)}
                </h1>
                <p className='text-lg text-gray-600 mt-1'>
                  {capitalizeFirstLetter(primaryRole)}
                </p>
                <div className='flex items-center gap-2 mt-2'>
                  <Badge className='bg-green-100 text-green-800'>Active</Badge>
                  {user?.is_superuser && (
                    <Badge className='bg-purple-100 text-purple-800'>
                      Superuser
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className='flex gap-2'>
              <Link href='/settings'>
                <Button variant='outline'>
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Profile
                </Button>
              </Link>
              <Button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className='bg-red-600 hover:bg-red-700'
              >
                <LogOut className='h-4 w-4 mr-2' />
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </Card>
        {/* Contact Information */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Contact Information
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center'>
                <Mail className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Email</p>
                <p className='font-medium text-gray-900'>{user?.email}</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center'>
                <Phone className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Phone</p>
                {/* phone_number not in API response — show fallback */}
                <p className='font-medium text-gray-400 italic'>Not provided</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center'>
                <Briefcase className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Department</p>
                {/* department not in API response — show fallback */}
                <p className='font-medium text-gray-400 italic'>Not provided</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center'>
                <Shield className='h-5 w-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Role</p>
                <p className='font-medium text-gray-900'>
                  {capitalizeFirstLetter(primaryRole)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Account Activity */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Account Activity
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <Calendar className='h-5 w-5 text-gray-600' />
              <div>
                <p className='text-sm text-gray-600'>Member Since</p>
                <p className='font-medium text-gray-900'>
                  {/* created_at not in login response — show fallback */}
                  Not available
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <Clock className='h-5 w-5 text-gray-600' />
              <div>
                <p className='text-sm text-gray-600'>Last Login</p>
                <p className='font-medium text-gray-900'>
                  {/* last_login not in login response — show fallback */}
                  Not available
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Performance Statistics */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Performance Statistics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {stats.map(stat => (
              <div
                key={stat.label}
                className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100'
              >
                <p className='text-sm text-gray-600 mb-2'>{stat.label}</p>
                <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>
        {/* Security */}
        <Card className='p-6 border-red-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Security &amp; Logout
          </h2>
          <p className='text-gray-600 mb-4'>
            Click the logout button to securely end your session and return to
            the login page.
          </p>
          <Button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className='bg-red-600 hover:bg-red-700'
          >
            <LogOut className='h-4 w-4 mr-2' />
            {isLoggingOut ? 'Signing out...' : 'Logout from All Devices'}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
