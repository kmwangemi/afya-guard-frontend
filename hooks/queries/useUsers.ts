import { userService } from '@/services/userService';
import {
  AssignRolesPayload,
  CreateUserPayload,
  UpdateUserPayload,
} from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const USER_KEY = 'users';
const ROLES_KEY = 'roles';

// ── Existing /profile hooks (unchanged) ───────────────────────────────────────────

export function useMyProfile() {
  return useQuery({
    queryKey: [USER_KEY, 'profile'],
    queryFn: () => userService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: [USER_KEY, 'profile', 'stats'],
    queryFn: () => userService.getMyStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userService.updateMyProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: [USER_KEY, 'profile'] }),
  });
}

export function useChangePassword() {
  return useMutation({ mutationFn: userService.changePassword });
}

// ── Admin: user list ──────────────────────────────────────────────────────────

export function useUsers(
  params: {
    page?: number;
    pageSize?: number;
    isActive?: boolean | null;
    search?: string;
  } = {},
) {
  return useQuery({
    queryKey: [USER_KEY, 'list', params],
    queryFn: () => userService.listUsers(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: prev => prev, // keep previous data while fetching next page
  });
}

// ── Admin: single user ────────────────────────────────────────────────────────

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: [USER_KEY, userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Admin: all roles (for dropdowns) ─────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: () => userService.listRoles(),
    staleTime: 10 * 60 * 1000, // roles change rarely
  });
}

// ── Admin: mutations ──────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USER_KEY, 'list'] }),
  });
}

export function useUpdateUser(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      userService.updateUser(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USER_KEY, 'list'] });
      qc.invalidateQueries({ queryKey: [USER_KEY, userId] });
    },
  });
}

export function useAssignRoles(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRolesPayload) =>
      userService.assignRoles(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [USER_KEY, 'list'] });
      qc.invalidateQueries({ queryKey: [USER_KEY, userId] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userService.deactivateUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USER_KEY, 'list'] }),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      userService.updateUser(userId, { isActive: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USER_KEY, 'list'] }),
  });
}
