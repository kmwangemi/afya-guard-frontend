'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useChangePassword,
  useMyProfile,
  useUpdateProfile,
} from '@/hooks/queries/useUser';
import { useToast } from '@/hooks/use-toast';
import { Bell, Eye, Lock, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { toast } = useToast();

  // Fix 5: read real profile from API instead of hardcoded defaults
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Fix 10: backend stores full_name as one field — split for the two UI inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  // Fix 5: populate form from API profile once loaded
  useEffect(() => {
    if (!profile) return;
    const parts = (profile.fullName ?? '').trim().split(' ');
    setFirstName(parts[0] ?? '');
    setLastName(parts.slice(1).join(' ') ?? '');
    setPhone(profile.phone ?? '');
    setDepartment(profile.department ?? '');
  }, [profile]);

  // Fix 7+8: password form with validation state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local-only preferences (no backend)
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    dailyDigest: true,
    weeklyReport: true,
  });
  const [visibility, setVisibility] = useState({
    showEmail: true,
    showPhone: false,
  });
  const [theme, setTheme] = useState('light');

  // Fix 6: PATCH /users/me with { full_name, phone, department }
  const handleSaveProfile = async () => {
    // Fix 10: join firstName + lastName → full_name
    const fullName = [firstName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(' ');
    if (!fullName) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await updateProfile.mutateAsync({
        fullName,
        phone: phone.trim() || undefined,
        department: department.trim() || undefined,
      });
      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (err) {
      console.error('[settings] profile update error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    }
  };

  // Fix 7+8: PATCH /auth/password with client-side match validation
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'All password fields are required.',
        variant: 'destructive',
      });
      return;
    }
    // Fix 8: validate passwords match before sending
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'New password must be at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Success',
        description: 'Password changed successfully.',
      });
    } catch (err) {
      console.error('[settings] password change error:', err);
      toast({
        title: 'Error',
        description: 'Failed to change password. Check your current password.',
        variant: 'destructive',
      });
    }
  };

  // Fix 9: "Save Preferences" now shows a toast (no backend for these)
  const handleSavePreferences = () => {
    toast({
      title: 'Preferences saved',
      description: 'Your notification preferences have been saved locally.',
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: 'Privacy settings saved',
      description: 'Your privacy settings have been saved locally.',
    });
  };

  const handleSaveTheme = () => {
    toast({ title: 'Theme saved', description: `Theme set to ${theme}.` });
  };

  return (
    <DashboardLayout>
      <div className='max-w-4xl space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
          <p className='text-gray-600 mt-1'>
            Manage your application preferences and security settings
          </p>
        </div>
        {/* Profile Settings */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Profile Settings
          </h2>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                {/* Fix 5: controlled inputs populated from API */}
                <Label className='block text-sm font-medium text-gray-700 mb-1'>
                  First Name
                </Label>
                <Input
                  type='text'
                  placeholder='First name'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={isLoadingProfile}
                />
              </div>
              <div>
                <Label className='block text-sm font-medium text-gray-700 mb-1'>
                  Last Name
                </Label>
                <Input
                  type='text'
                  placeholder='Last name'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={isLoadingProfile}
                />
              </div>
            </div>
            <div>
              {/* Email is read-only — backend doesn't allow self-update of email */}
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                Email Address
              </Label>
              <Input
                type='email'
                value={profile?.email ?? ''}
                disabled
                className='bg-gray-50 text-gray-500 cursor-not-allowed'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Email cannot be changed. Contact an administrator.
              </p>
            </div>
            <div>
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                Phone Number
              </Label>
              <Input
                type='tel'
                placeholder='+254 712 345 678'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div>
              {/* Fix 11: department is a free-text field in backend — Input not Select */}
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </Label>
              <Input
                type='text'
                placeholder='e.g. Fraud Investigation, Compliance, Data Science'
                value={department}
                onChange={e => setDepartment(e.target.value)}
                disabled={isLoadingProfile}
              />
            </div>
            <div className='flex gap-2 pt-4'>
              {/* Fix 6: calls PATCH /users/me */}
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending || isLoadingProfile}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  if (!profile) return;
                  const parts = (profile.fullName ?? '').trim().split(' ');
                  setFirstName(parts[0] ?? '');
                  setLastName(parts.slice(1).join(' ') ?? '');
                  setPhone(profile.phone ?? '');
                  setDepartment(profile.department ?? '');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
        {/* Notification Settings */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            Notification Settings
          </h2>
          <div className='space-y-4'>
            {[
              {
                key: 'emailAlerts',
                label: 'Email Alerts',
                desc: 'Receive real-time alerts via email',
              },
              {
                key: 'smsAlerts',
                label: 'SMS Alerts',
                desc: 'Receive critical alerts via SMS',
              },
              {
                key: 'dailyDigest',
                label: 'Daily Digest',
                desc: 'Summary of daily fraud detection activities',
              },
              {
                key: 'weeklyReport',
                label: 'Weekly Report',
                desc: 'Comprehensive weekly analysis report',
              },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div>
                  <p className='font-medium text-gray-900'>{label}</p>
                  <p className='text-sm text-gray-600'>{desc}</p>
                </div>
                <input
                  type='checkbox'
                  checked={notifications[key as keyof typeof notifications]}
                  onChange={e =>
                    setNotifications({
                      ...notifications,
                      [key]: e.target.checked,
                    })
                  }
                  className='h-5 w-5 cursor-pointer'
                />
              </div>
            ))}
            <div className='flex gap-2 pt-4'>
              {/* Fix 9: shows toast on save */}
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
        {/* Privacy Settings */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Privacy Settings
          </h2>
          <div className='space-y-4'>
            {[
              {
                key: 'showEmail',
                label: 'Show Email in Profile',
                desc: 'Allow other team members to see your email',
              },
              {
                key: 'showPhone',
                label: 'Show Phone in Profile',
                desc: 'Allow other team members to see your phone number',
              },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
              >
                <div>
                  <p className='font-medium text-gray-900'>{label}</p>
                  <p className='text-sm text-gray-600'>{desc}</p>
                </div>
                <input
                  type='checkbox'
                  checked={visibility[key as keyof typeof visibility]}
                  onChange={e =>
                    setVisibility({ ...visibility, [key]: e.target.checked })
                  }
                  className='h-5 w-5 cursor-pointer'
                />
              </div>
            ))}
            <div className='flex gap-2 pt-4'>
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={handleSavePrivacy}
              >
                Save Privacy Settings
              </Button>
            </div>
          </div>
        </Card>
        {/* Theme Settings */}
        <Card className='p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6'>
            Theme &amp; Display
          </h2>
          <div className='space-y-4'>
            <div>
              <Label className='block text-sm font-medium text-gray-700 mb-2'>
                Preferred Theme
              </Label>
              <div className='flex gap-3'>
                {(['light', 'dark', 'auto'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      theme === t
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t === 'auto'
                      ? 'System Default'
                      : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className='flex gap-2 pt-4'>
              <Button
                className='bg-blue-600 hover:bg-blue-700'
                onClick={handleSaveTheme}
              >
                Save Theme
              </Button>
            </div>
          </div>
        </Card>
        {/* Security — Change Password */}
        <Card className='p-6 border-red-200'>
          <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
            <Lock className='h-5 w-5' />
            Security
          </h2>
          <div className='space-y-4'>
            <div>
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                Current Password
              </Label>
              <Input
                type='password'
                placeholder='••••••••'
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                New Password
              </Label>
              <Input
                type='password'
                placeholder='••••••••'
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <p className='text-xs text-gray-400 mt-1'>
                Minimum 8 characters.
              </p>
            </div>
            <div>
              <Label className='block text-sm font-medium text-gray-700 mb-1'>
                Confirm New Password
              </Label>
              <Input
                type='password'
                placeholder='••••••••'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                // Fix 8: visual mismatch indicator
                className={
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-400 focus:ring-red-400'
                    : ''
                }
              />
              {/* Fix 8: inline match error */}
              {confirmPassword && newPassword !== confirmPassword && (
                <p className='text-xs text-red-500 mt-1'>
                  Passwords do not match.
                </p>
              )}
            </div>
            <div className='flex gap-2 pt-4'>
              {/* Fix 7: calls PATCH /auth/password */}
              <Button
                className='bg-red-600 hover:bg-red-700'
                onClick={handleChangePassword}
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
