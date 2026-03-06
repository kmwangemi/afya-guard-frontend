'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLogout } from '@/hooks/queries/useAuth';
import { useMyProfile, useMyStats } from '@/hooks/queries/useUser';
import { capitalizeFirstLetter, formatToNewDate } from '@/lib/utils';
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
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Fix 2+3: useMyProfile fetches from GET /users/me — includes created_at
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  // Fix 1: useMyStats fetches from GET /users/me/stats — replaces hardcoded values
  const { data: stats, isLoading: isLoadingStats } = useMyStats();

  // API returns full_name — split for display only
  const fullName = profile?.fullName ?? '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] ?? '';
  const lastName = nameParts.slice(1).join(' ') ?? '';

  // Show first role's displayName or name
  const primaryRole =
    profile?.roles?.[0]?.displayName ?? profile?.roles?.[0]?.name ?? '';

  // Fix 1: stat tiles driven by API — was hardcoded strings
  const statTiles = [
    {
      label: 'Cases Investigated',
      value: isLoadingStats
        ? '—'
        : (stats?.casesInvestigated ?? 0).toLocaleString(),
    },
    {
      label: 'Alerts Reviewed',
      value: isLoadingStats
        ? '—'
        : (stats?.alertsReviewed ?? 0).toLocaleString(),
    },
    {
      label: 'Fraud Cases Confirmed',
      value: isLoadingStats
        ? '—'
        : (stats?.fraudCasesConfirmed ?? 0).toLocaleString(),
    },
    {
      label: 'Total Fraud Amount Recovered',
      // Fix 1: pre-formatted string from backend e.g. "KES 2.4M"
      value: isLoadingStats ? '—' : (stats?.totalFraudAmountDisplay ?? 'KES 0'),
    },
  ];

  return (
    <DashboardLayout>
      <div className='max-w-4xl space-y-6'>
        {/* Profile Header */}
        <Card className='p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-6'>
              {/* Avatar — initials from fullName */}
              <div className='h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg'>
                {fullName
                  ? fullName
                      .trim()
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '??'}
              </div>
              <div>
                {isLoadingProfile ? (
                  <div className='h-8 w-48 bg-gray-200 animate-pulse rounded mb-2' />
                ) : (
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {capitalizeFirstLetter(firstName)}{' '}
                    {capitalizeFirstLetter(lastName)}
                  </h1>
                )}
                <p className='text-lg text-gray-600 mt-1'>
                  {capitalizeFirstLetter(primaryRole)}
                </p>
                <div className='flex items-center gap-2 mt-2'>
                  <Badge className='bg-green-100 text-green-800'>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {profile?.isSuperuser && (
                    <Badge className='bg-purple-100 text-purple-800'>
                      Superuser
                    </Badge>
                  )}
                  {profile?.mustChangePassword && (
                    <Badge className='bg-yellow-100 text-yellow-800'>
                      Password Change Required
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
                <p className='font-medium text-gray-900'>
                  {profile?.email ?? '—'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center'>
                <Phone className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Phone</p>
                <p
                  className={`font-medium ${profile?.phone ? 'text-gray-900' : 'text-gray-400 italic'}`}
                >
                  {profile?.phone ?? 'Not Provided'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center'>
                <Briefcase className='h-5 w-5 text-purple-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Department</p>
                <p
                  className={`font-medium ${profile?.department ? 'text-gray-900' : 'text-gray-400 italic'}`}
                >
                  {profile?.department ?? 'Not Provided'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center'>
                <Shield className='h-5 w-5 text-yellow-600' />
              </div>
              <div>
                <p className='text-sm text-gray-600'>Role</p>
                <p className='font-medium text-gray-900'>
                  {capitalizeFirstLetter(primaryRole) || '—'}
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
                {/* Fix 2: created_at IS returned by /users/me via TimestampMixin */}
                <p className='font-medium text-gray-900'>
                  {profile?.createdAt
                    ? formatToNewDate(profile.createdAt)
                    : isLoadingProfile
                      ? '—'
                      : 'Not available'}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
              <Clock className='h-5 w-5 text-gray-600' />
              <div>
                <p className='text-sm text-gray-600'>Last Login</p>
                <p className='font-medium text-gray-900'>
                  {profile?.lastLoginAt
                    ? formatToNewDate(profile.lastLoginAt)
                    : isLoadingProfile
                      ? '—'
                      : 'Not Available'}
                </p>
              </div>
            </div>
          </div>
        </Card>
        {/* Performance Statistics */}
        {/* Fix 1+4: live data from /users/me/stats with loading state */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Performance Statistics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {statTiles.map(stat => (
              <div
                key={stat.label}
                className='bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100'
              >
                <p className='text-sm text-gray-600 mb-2'>{stat.label}</p>
                <p
                  className={`text-2xl font-bold ${isLoadingStats ? 'text-gray-300 animate-pulse' : 'text-gray-900'}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
        {/* Roles & Permissions */}
        {(profile?.roles?.length ?? 0) > 0 && (
          <Card className='p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Roles &amp; Permissions
            </h2>
            <div className='space-y-3'>
              {profile!.roles.map(role => (
                <div
                  key={role.id}
                  className='flex items-start justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium text-gray-900'>
                      {role.displayName ?? role.name}
                    </p>
                    {role.description && (
                      <p className='text-sm text-gray-500 mt-0.5'>
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1 max-w-xs'>
                    {role.permissions.slice(0, 4).map(p => (
                      <Badge
                        key={p.id}
                        className='bg-blue-50 text-blue-700 text-xs'
                      >
                        {p.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 4 && (
                      <Badge className='bg-gray-100 text-gray-600 text-xs'>
                        +{role.permissions.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
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
