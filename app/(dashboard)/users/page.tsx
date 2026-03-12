'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAssignRoles,
  useCreateUser,
  useDeactivateUser,
  useReactivateUser,
  useRoles,
  useUpdateUser,
  useUsers,
} from '@/hooks/queries/useUsers';
import { formatDateTime } from '@/lib/helpers';
import { Role, UserListItem } from '@/types/user';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Shield,
  ShieldOff,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function avatarColor(id: string) {
  const colors = [
    'bg-blue-500',
    'bg-violet-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  const idx = id.charCodeAt(0) % colors.length;
  return colors[idx];
}

const DEPARTMENTS = [
  'Fraud Investigation',
  'Data Science',
  'Compliance',
  'Provider Relations',
  'Finance',
  'IT',
  'Management',
];

// ── Sub-components ────────────────────────────────────────────────────────────

/** Role badge pill */
function RoleBadge({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const cls =
    lower.includes('admin') || lower.includes('super')
      ? 'bg-red-100 text-red-700 border-red-200'
      : lower.includes('analyst') || lower.includes('investigat')
        ? 'bg-blue-100 text-blue-700 border-blue-200'
        : lower.includes('viewer') || lower.includes('read')
          ? 'bg-gray-100 text-gray-600 border-gray-200'
          : 'bg-violet-100 text-violet-700 border-violet-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {name}
    </span>
  );
}

/** Confirmation dialog */
function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4'>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}
        >
          <AlertTriangle
            className={`h-5 w-5 ${danger ? 'text-red-600' : 'text-amber-600'}`}
          />
        </div>
        <h3 className='text-base font-semibold text-gray-900 mb-1'>{title}</h3>
        <p className='text-sm text-gray-500 mb-5'>{body}</p>
        <div className='flex gap-3 justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            className={danger ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit / Create drawer ──────────────────────────────────────────────────────

interface DrawerProps {
  mode: 'create' | 'edit';
  user?: UserListItem | null;
  roles: Role[];
  onClose: () => void;
}

type CreateFormValues = {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  department: string;
  isSuperuser: boolean;
  roleIds: string[];
};

type EditFormValues = {
  fullName: string;
  phone: string;
  department: string;
  roleIds: string[];
};

function UserDrawer({ mode, user, roles, onClose }: DrawerProps) {
  const createMut = useCreateUser();
  const updateMut = useUpdateUser(user?.id ?? '');
  const rolesMut = useAssignRoles(user?.id ?? '');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormValues & EditFormValues>({
    defaultValues: {
      email: '',
      fullName: user?.fullName ?? '',
      phone: '',
      password: '',
      department: user?.department ?? '',
      isSuperuser: user?.isSuperuser ?? false,
      roleIds: user?.roles
        ? roles.filter(r => user.roles.includes(r.name)).map(r => r.id)
        : [],
    },
  });
  const selectedRoleIds: string[] = watch('roleIds') ?? [];
  const isSuperuser = watch('isSuperuser');
  function toggleRole(id: string) {
    const current = selectedRoleIds;
    setValue(
      'roleIds',
      current.includes(id) ? current.filter(x => x !== id) : [...current, id],
    );
  }
  const isLoading =
    createMut.isPending || updateMut.isPending || rolesMut.isPending;
  async function onSubmit(values: CreateFormValues & EditFormValues) {
    try {
      if (mode === 'create') {
        await createMut.mutateAsync({
          email: values.email,
          fullName: values.fullName,
          phone: values.phone || undefined,
          password: values.password,
          roleIds: values.roleIds,
          isSuperuser: values.isSuperuser,
          department: values.department || undefined,
        });
        toast.success('User created successfully.');
      } else {
        await updateMut.mutateAsync({
          fullName: values.fullName,
          phone: values.phone || undefined,
          department: values.department || undefined,
        });
        await rolesMut.mutateAsync({ roleIds: values.roleIds });
        toast.success('Profile updated successfully.');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    }
  }
  return (
    <div className='fixed inset-0 z-40 flex justify-end'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      {/* Panel */}
      <div className='relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div className='flex items-center gap-2'>
            {mode === 'create' ? (
              <Plus className='h-4 w-4 text-blue-600' />
            ) : (
              <Edit2 className='h-4 w-4 text-blue-600' />
            )}
            <h2 className='font-semibold text-gray-900'>
              {mode === 'create' ? 'Add New User' : `Edit — ${user?.fullName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex-1 overflow-y-auto px-6 py-5 space-y-5'
        >
          {/* Full name */}
          <div>
            <Label
              htmlFor='fullName'
              className='text-sm font-medium text-gray-700'
            >
              Full Name *
            </Label>
            <Input
              id='fullName'
              className='mt-1'
              placeholder='e.g. Amina Odhiambo'
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Min 2 characters' },
              })}
            />
            {errors.fullName && (
              <p className='text-xs text-red-500 mt-1'>
                {errors.fullName.message}
              </p>
            )}
          </div>
          {/* Email — create only */}
          {mode === 'create' && (
            <div>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700'
              >
                Email Address *
              </Label>
              <Input
                id='email'
                type='email'
                className='mt-1'
                placeholder='amina@sha.go.ke'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email',
                  },
                })}
              />
              {errors.email && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>
          )}
          {/* Password — create only */}
          {mode === 'create' && (
            <div>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-700'
              >
                Temporary Password *
              </Label>
              <Input
                id='password'
                type='password'
                className='mt-1'
                placeholder='Minimum 8 characters'
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              {errors.password && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.password.message}
                </p>
              )}
              <p className='text-xs text-gray-400 mt-1'>
                User will be prompted to change this on first login.
              </p>
            </div>
          )}
          {/* Phone */}
          <div>
            <Label
              htmlFor='phone'
              className='text-sm font-medium text-gray-700'
            >
              Phone
            </Label>
            <Input
              id='phone'
              className='mt-1'
              placeholder='+254 7XX XXX XXX'
              {...register('phone')}
            />
          </div>
          {/* Department */}
          <div>
            <Label
              htmlFor='department'
              className='text-sm font-medium text-gray-700'
            >
              Department
            </Label>
            <select
              id='department'
              className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring'
              {...register('department')}
            >
              <option value=''>— Select department —</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          {/* Superuser toggle — create only */}
          {mode === 'create' && (
            <div className='flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg'>
              <input
                id='isSuperuser'
                type='checkbox'
                className='h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500'
                {...register('isSuperuser')}
              />
              <div>
                <Label
                  htmlFor='isSuperuser'
                  className='text-sm font-medium text-red-700 cursor-pointer'
                >
                  Grant Superuser Access
                </Label>
                <p className='text-xs text-red-500'>
                  Superusers bypass all permission checks. Use sparingly.
                </p>
              </div>
            </div>
          )}
          {/* Roles */}
          <div>
            <Label className='text-sm font-medium text-gray-700 mb-2 block'>
              Roles
            </Label>
            {roles.length === 0 ? (
              <p className='text-xs text-gray-400'>No roles available</p>
            ) : (
              <div className='space-y-2'>
                {roles.map(role => {
                  const checked = selectedRoleIds.includes(role.id);
                  return (
                    <label
                      key={role.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={() => toggleRole(role.id)}
                        className='mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-800'>
                          {role.displayName ?? role.name}
                        </p>
                        {role.description && (
                          <p className='text-xs text-gray-400 mt-0.5 truncate'>
                            {role.description}
                          </p>
                        )}
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {role.permissions.length} permission
                          {role.permissions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </form>
        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className='min-w-[100px]'
          >
            {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
            {mode === 'create' ? 'Create User' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function UsersPage() {
  // ── State ────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<UserListItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'reactivate';
    user: UserListItem;
  } | null>(null);

  const PAGE_SIZE = 15;

  // Debounce search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useUsers({
    page,
    pageSize: PAGE_SIZE,
    isActive: filterActive,
    search: debouncedSearch || undefined,
  });
  const { data: roles = [] } = useRoles();
  // ── Mutations ────────────────────────────────────────────────────────────────
  const deactivateMut = useDeactivateUser();
  const reactivateMut = useReactivateUser();
  async function handleConfirm() {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'deactivate') {
        await deactivateMut.mutateAsync(confirmAction.user.id);
        toast.success('User deactivated successfully.');
      } else {
        await reactivateMut.mutateAsync(confirmAction.user.id);
        toast.success('User reactivated successfully.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setConfirmAction(null);
    }
  }
  // ── Render ───────────────────────────────────────────────────────────────────
  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pages ?? 1;
  const activeCount = users.filter(u => u.isActive).length;
  const inactiveCount = users.filter(u => !u.isActive).length;
  const isConfirmLoading = deactivateMut.isPending || reactivateMut.isPending;
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              User Management
            </h1>
            <p className='text-gray-500 mt-1 text-sm'>
              Manage system users, roles, and access permissions
            </p>
          </div>
          <Button
            onClick={() => {
              setEditTarget(null);
              setDrawerMode('create');
            }}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add User
          </Button>
        </div>
        {/* ── Summary cards ───────────────────────────────────────────────── */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              label: 'Total Users',
              value: isLoading ? '—' : total.toLocaleString(),
              icon: Users,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Active',
              value: isLoading
                ? '—'
                : (data?.items
                    .filter(u => u.isActive)
                    .length.toLocaleString() ?? '—'),
              icon: UserCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Inactive',
              value: isLoading
                ? '—'
                : (data?.items
                    .filter(u => !u.isActive)
                    .length.toLocaleString() ?? '—'),
              icon: UserMinus,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
          ].map(s => (
            <Card key={s.label} className='p-5 flex items-center gap-4'>
              <div className={`p-2.5 rounded-lg ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className='text-xs text-gray-500 font-medium uppercase tracking-wide'>
                  {s.label}
                </p>
                <p className='text-2xl font-bold text-gray-900'>{s.value}</p>
              </div>
            </Card>
          ))}
        </div>
        {/* ── Filters + search ────────────────────────────────────────────── */}
        <div className='flex flex-col sm:flex-row gap-3'>
          {/* Search */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              className='pl-9'
              placeholder='Search by name or email…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
          {/* Status filter */}
          <div className='flex rounded-md border border-gray-200 overflow-hidden shrink-0'>
            {(
              [
                { label: 'All', value: null },
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ] as const
            ).map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setFilterActive(opt.value);
                  setPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  filterActive === opt.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {/* ── User table ──────────────────────────────────────────────────── */}
        <Card className='overflow-hidden'>
          {/* Table header */}
          <div className='grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-x-4 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
            <span className='w-9' />
            <span>User</span>
            <span>Department / Roles</span>
            <span>Last Login</span>
            <span>Status</span>
            <span className='text-right pr-1'>Actions</span>
          </div>
          {/* Loading skeleton */}
          {isLoading && (
            <div className='divide-y divide-gray-50'>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className='grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-x-4 px-4 py-3.5 animate-pulse'
                >
                  <div className='w-9 h-9 bg-gray-200 rounded-full' />
                  <div className='space-y-1.5'>
                    <div className='h-3.5 bg-gray-200 rounded w-32' />
                    <div className='h-3 bg-gray-100 rounded w-44' />
                  </div>
                  <div className='h-3 bg-gray-200 rounded w-28' />
                  <div className='h-3 bg-gray-200 rounded w-24' />
                  <div className='h-5 bg-gray-200 rounded-full w-16' />
                  <div className='h-7 bg-gray-200 rounded w-20' />
                </div>
              ))}
            </div>
          )}
          {/* Empty state */}
          {!isLoading && users.length === 0 && (
            <div className='py-16 text-center'>
              <Users className='h-12 w-12 text-gray-200 mx-auto mb-3' />
              <p className='text-gray-400 text-sm'>No users found</p>
              {(search || filterActive !== null) && (
                <p className='text-gray-400 text-xs mt-1'>
                  Try clearing your search or filter
                </p>
              )}
            </div>
          )}
          {/* Rows */}
          {!isLoading && users.length > 0 && (
            <div
              className={`divide-y divide-gray-50 ${isFetching ? 'opacity-60' : ''} transition-opacity`}
            >
              {users.map(user => (
                <div
                  key={user.id}
                  className='grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-x-4 px-4 py-3.5 hover:bg-gray-50/70 transition-colors'
                >
                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(user.id)} ${!user.isActive ? 'opacity-40' : ''}`}
                  >
                    {initials(user.fullName)}
                  </div>
                  {/* Name + email */}
                  <div className='min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <span
                        className={`text-sm font-medium truncate ${!user.isActive ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        {user.fullName}
                      </span>
                      {user.isSuperuser && (
                        <Shield className='h-3.5 w-3.5 text-red-500 shrink-0' />
                      )}
                    </div>
                    <p className='text-xs text-gray-400 truncate'>
                      {user.email}
                    </p>
                  </div>
                  {/* Department + roles */}
                  <div className='min-w-0'>
                    {user.department && (
                      <p className='text-xs text-gray-500 mb-1 truncate'>
                        {user.department}
                      </p>
                    )}
                    <div className='flex flex-wrap gap-1'>
                      {user.roles.slice(0, 2).map(r => (
                        <RoleBadge key={r} name={r} />
                      ))}
                      {user.roles.length > 2 && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500'>
                          +{user.roles.length - 2}
                        </span>
                      )}
                      {user.roles.length === 0 && (
                        <span className='text-xs text-gray-300 italic'>
                          No roles
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Last login */}
                  <div>
                    {user.lastLoginAt ? (
                      <p className='text-xs text-gray-500'>
                        {formatDateTime(new Date(user.lastLoginAt))}
                      </p>
                    ) : (
                      <p className='text-xs text-gray-300 italic'>Never</p>
                    )}
                  </div>
                  {/* Status badge */}
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                      />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className='flex items-center gap-1 justify-end'>
                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditTarget(user);
                        setDrawerMode('edit');
                      }}
                      className='p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
                      title='Edit user'
                    >
                      <Edit2 className='h-3.5 w-3.5' />
                    </button>
                    {/* Deactivate / reactivate */}
                    {user.isActive ? (
                      <button
                        onClick={() =>
                          setConfirmAction({ type: 'deactivate', user })
                        }
                        className='p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors'
                        title='Deactivate user'
                      >
                        <ShieldOff className='h-3.5 w-3.5' />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setConfirmAction({ type: 'reactivate', user })
                        }
                        className='p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors'
                        title='Reactivate user'
                      >
                        <KeyRound className='h-3.5 w-3.5' />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination footer */}
          {!isLoading && total > PAGE_SIZE && (
            <div className='flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50'>
              <p className='text-xs text-gray-500'>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, total)} of{' '}
                <span className='font-medium text-gray-700'>
                  {total.toLocaleString()}
                </span>{' '}
                users
              </p>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className='p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronLeft className='h-4 w-4' />
                </button>
                <span className='text-xs text-gray-600 font-medium px-1'>
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className='p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronRight className='h-4 w-4' />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {/* ── Edit / Create drawer ─────────────────────────────────────────── */}
      {drawerMode && (
        <UserDrawer
          mode={drawerMode}
          user={editTarget}
          roles={roles}
          onClose={() => {
            setDrawerMode(null);
            setEditTarget(null);
          }}
        />
      )}
      {/* ── Confirm dialog ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmAction}
        title={
          confirmAction?.type === 'deactivate'
            ? `Deactivate ${confirmAction.user.fullName}?`
            : `Reactivate ${confirmAction?.user.fullName}?`
        }
        body={
          confirmAction?.type === 'deactivate'
            ? 'This user will no longer be able to log in. Their data is preserved and the account can be reactivated at any time.'
            : 'This user will regain access with their existing roles and permissions.'
        }
        confirmLabel={
          confirmAction?.type === 'deactivate' ? 'Deactivate' : 'Reactivate'
        }
        danger={confirmAction?.type === 'deactivate'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={isConfirmLoading}
      />
    </DashboardLayout>
  );
}
