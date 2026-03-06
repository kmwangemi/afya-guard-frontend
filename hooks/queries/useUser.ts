import { userService } from '@/services/userService';
import { ChangePasswordPayload, UpdateProfilePayload } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const USER_KEY = 'user';

// ─── Query hooks ──────────────────────────────────────────────────────────────

// GET /users/me — full profile with created_at, roles, etc.
export function useMyProfile() {
  return useQuery({
    queryKey: [USER_KEY, 'profile'],
    queryFn: () => userService.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}
// Fix 1: GET /users/profile/stats — replaces hardcoded stat values
export function useMyStats() {
  return useQuery({
    queryKey: [USER_KEY, 'profile', 'stats'],
    queryFn: () => userService.getMyStats(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

// Fix 6: PATCH /users/profile with { full_name, phone, department }
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      userService.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY, 'profile'] });
    },
  });
}
// Fix 7: PATCH /auth/password with { current_password, new_password, confirm_password }
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      userService.changePassword(payload),
  });
}
