'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useChangePassword,
  useMyProfile,
  useUpdateProfile,
} from '@/hooks/queries/useUser';
import { apiClient } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Eye, Lock, Settings, UserPlus, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Role {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  is_system_role: boolean;
}

interface RegisterUserPayload {
  email: string;
  full_name: string;
  phone: string;
  password: string;
  role_ids: string[];
  is_superuser: boolean;
}

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  department: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useRoles() {
  return useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/roles');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useRegisterUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterUserPayload) => {
      const res = await apiClient.post('/users', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ── Profile Section ───────────────────────────────────────────────────────────

function ProfileSection() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: { firstName: '', lastName: '', phone: '', department: '' },
  });
  useEffect(() => {
    if (!profile) return;
    const parts = (profile.fullName ?? '').trim().split(' ');
    reset({
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' ') ?? '',
      phone: profile.phone ?? '',
      department: profile.department ?? '',
    });
  }, [profile, reset]);
  const onSubmit = async (values: ProfileFormValues) => {
    const fullName = [values.firstName.trim(), values.lastName.trim()]
      .filter(Boolean)
      .join(' ');
    try {
      await updateProfile.mutateAsync({
        fullName,
        phone: values.phone.trim() || undefined,
        department: values.department.trim() || undefined,
      });
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    }
  };
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <Settings className='h-5 w-5' />
        Profile Settings
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              First Name
            </Label>
            <Input
              {...register('firstName', { required: 'First name is required' })}
              placeholder='First name'
              disabled={isLoading}
            />
            {errors.firstName && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Last Name
            </Label>
            <Input
              {...register('lastName')}
              placeholder='Last name'
              disabled={isLoading}
            />
          </div>
        </div>
        <div>
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
            {...register('phone')}
            type='tel'
            placeholder='+254 712 345 678'
            disabled={isLoading}
          />
        </div>
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Department
          </Label>
          <Input
            {...register('department')}
            type='text'
            placeholder='e.g. Fraud Investigation, Compliance, Data Science'
            disabled={isLoading}
          />
        </div>
        <div className='flex gap-2 pt-4'>
          <Button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700'
            disabled={updateProfile.isPending || isLoading || !isDirty}
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              if (!profile) return;
              const parts = (profile.fullName ?? '').trim().split(' ');
              reset({
                firstName: parts[0] ?? '',
                lastName: parts.slice(1).join(' ') ?? '',
                phone: profile.phone ?? '',
                department: profile.department ?? '',
              });
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Register User Section ─────────────────────────────────────────────────────

interface RegisterFormValues {
  email: string;
  full_name: string;
  phone: string;
  password: string;
  confirm_password: string;
  role_ids: string[];
  is_superuser: boolean;
}

function RegisterUserSection() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const registerUser = useRegisterUser();
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      password: '',
      confirm_password: '',
      role_ids: [],
      is_superuser: false,
    },
  });
  const selectedRoleIds = watch('role_ids');
  const newPassword = watch('password');
  const toggleRole = (roleId: string) => {
    const current = selectedRoleIds ?? [];
    const updated = current.includes(roleId)
      ? current.filter(id => id !== roleId)
      : [...current, roleId];
    setValue('role_ids', updated, { shouldValidate: true });
  };
  const onSubmit = async (values: RegisterFormValues) => {
    const { confirm_password, ...rest } = values;
    try {
      await registerUser.mutateAsync(rest);
      reset();
      toast.success('User registered successfully.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? 'Failed to register user.';
      toast.error(detail);
    }
  };
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <UserPlus className='h-5 w-5' />
        Register New User
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Full name + Email */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Full Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...register('full_name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
              placeholder='Kelvin Mwas'
            />
            {errors.full_name && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address <span className='text-red-500'>*</span>
            </Label>
            <Input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
              type='email'
              placeholder='user@example.com'
            />
            {errors.email && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
        {/* Phone */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Phone Number
          </Label>
          <Input
            {...register('phone')}
            type='tel'
            placeholder='+254 712 345 678'
          />
        </div>
        {/* Password */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Password <span className='text-red-500'>*</span>
            </Label>
            <PasswordInput
              placeholder='••••••••'
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              // disabled={isPending}
              className='border-gray-300'
            />
            {errors.password && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <Label className='block text-sm font-medium text-gray-700 mb-1'>
              Confirm Password <span className='text-red-500'>*</span>
            </Label>
            <PasswordInput
              placeholder='••••••••'
              {...register('confirm_password', {
                required: 'Please confirm the password',
                validate: val =>
                  val === newPassword || 'Passwords do not match',
              })}
              // disabled={isPending}
              className='border-gray-300'
            />
            {errors.confirm_password && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>
        {/* Roles — multi-select as toggleable badges */}
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-2'>
            Roles <span className='text-red-500'>*</span>
          </Label>
          {rolesLoading ? (
            <div className='flex gap-2 flex-wrap'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='h-9 w-32 bg-gray-100 rounded-full animate-pulse'
                />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <p className='text-sm text-gray-500'>
              No roles available. Create roles first.
            </p>
          ) : (
            <Controller
              name='role_ids'
              control={control}
              rules={{
                validate: v => v.length > 0 || 'Select at least one role',
              }}
              render={() => (
                <div className='flex flex-wrap gap-2'>
                  {roles.map(role => {
                    const selected = selectedRoleIds.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type='button'
                        onClick={() => toggleRole(role.id)}
                        title={role.description ?? role.name}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                          font-medium border transition-all duration-150 select-none
                          ${
                            selected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                          }
                        `}
                      >
                        {selected && <X className='h-3 w-3' />}
                        {role.display_name ?? role.name}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          )}
          {/* Selected role pills summary */}
          {selectedRoleIds.length > 0 && (
            <p className='text-xs text-gray-500 mt-2'>
              {selectedRoleIds.length} role
              {selectedRoleIds.length > 1 ? 's' : ''} selected
            </p>
          )}
          {errors.role_ids && (
            <p className='text-xs text-red-500 mt-1'>
              {errors.role_ids.message as string}
            </p>
          )}
        </div>
        {/* Superuser toggle */}
        <div className='flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg'>
          <div>
            <p className='font-medium text-gray-900'>Superuser Access</p>
            <p className='text-sm text-gray-600'>
              Grants unrestricted access to all system features. Use with
              caution.
            </p>
          </div>
          <Controller
            name='is_superuser'
            control={control}
            render={({ field }) => (
              <input
                type='checkbox'
                checked={field.value}
                onChange={e => field.onChange(e.target.checked)}
                className='h-5 w-5 cursor-pointer accent-amber-500'
              />
            )}
          />
        </div>
        <div className='flex gap-2 pt-2'>
          <Button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700'
            disabled={registerUser.isPending}
          >
            {registerUser.isPending ? 'Registering...' : 'Register User'}
          </Button>
          <Button type='button' variant='outline' onClick={() => reset()}>
            Clear
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Password Section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const newPassword = watch('newPassword');
  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      reset();
      toast.success('Password changed successfully.');
    } catch {
      toast.success('Failed to change password. Check your current password.');
    }
  };
  return (
    <Card className='p-6 border-red-200'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <Lock className='h-5 w-5' />
        Security
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Current Password
          </Label>
          <Input
            {...register('currentPassword', {
              required: 'Current password is required',
            })}
            type='password'
            placeholder='••••••••'
          />
          {errors.currentPassword && (
            <p className='text-xs text-red-500 mt-1'>
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            New Password
          </Label>
          <Input
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
            type='password'
            placeholder='••••••••'
          />
          <p className='text-xs text-gray-400 mt-1'>Minimum 8 characters.</p>
          {errors.newPassword && (
            <p className='text-xs text-red-500 mt-1'>
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-1'>
            Confirm New Password
          </Label>
          <Input
            {...register('confirmPassword', {
              required: 'Please confirm your new password',
              validate: val => val === newPassword || 'Passwords do not match',
            })}
            type='password'
            placeholder='••••••••'
            className={
              errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''
            }
          />
          {errors.confirmPassword && (
            <p className='text-xs text-red-500 mt-1'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className='flex gap-2 pt-4'>
          <Button
            type='submit'
            className='bg-red-600 hover:bg-red-700'
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Privacy Section (local-only) ──────────────────────────────────────────────

function PrivacySection() {
  const { register, handleSubmit } = useForm({
    defaultValues: { showEmail: true, showPhone: false },
  });
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <Eye className='h-5 w-5' />
        Privacy Settings
      </h2>
      <form
        onSubmit={handleSubmit(() =>
          toast.success('Privacy settings saved successfully.'),
        )}
        className='space-y-4'
      >
        {[
          {
            name: 'showEmail' as const,
            label: 'Show Email in Profile',
            desc: 'Allow other team members to see your email',
          },
          {
            name: 'showPhone' as const,
            label: 'Show Phone in Profile',
            desc: 'Allow other team members to see your phone number',
          },
        ].map(({ name, label, desc }) => (
          <div
            key={name}
            className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
          >
            <div>
              <p className='font-medium text-gray-900'>{label}</p>
              <p className='text-sm text-gray-600'>{desc}</p>
            </div>
            <input
              {...register(name)}
              type='checkbox'
              className='h-5 w-5 cursor-pointer'
            />
          </div>
        ))}
        <div className='flex gap-2 pt-4'>
          <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
            Save Privacy Settings
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Theme Section (local-only) ────────────────────────────────────────────────

function ThemeSection() {
  const { watch, setValue, handleSubmit } = useForm({
    defaultValues: { theme: 'light' as 'light' | 'dark' | 'auto' },
  });
  const theme = watch('theme');
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2'>
        <Bell className='h-5 w-5' />
        Theme &amp; Display
      </h2>
      <form
        onSubmit={handleSubmit(values =>
          toast.success('Theme saved successfully.'),
        )}
        className='space-y-4'
      >
        <div>
          <Label className='block text-sm font-medium text-gray-700 mb-2'>
            Preferred Theme
          </Label>
          <div className='flex gap-3'>
            {(['light', 'dark', 'auto'] as const).map(t => (
              <button
                key={t}
                type='button'
                onClick={() => setValue('theme', t)}
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
        <div className='pt-2'>
          <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
            Save Theme
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className='max-w-4xl space-y-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
          <p className='text-gray-600 mt-1'>
            Manage your application preferences and security settings
          </p>
        </div>
        <ProfileSection />
        <RegisterUserSection />
        <PrivacySection />
        <ThemeSection />
        <SecuritySection />
      </div>
    </DashboardLayout>
  );
}
