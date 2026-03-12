import { api } from '@/lib/api';
import {
  AssignRolesPayload,
  ChangePasswordPayload,
  CreateUserPayload,
  PaginatedUsers,
  Role,
  UpdateProfilePayload,
  UpdateUserPayload,
  UserListItem,
  UserPerformanceStats,
  UserProfile,
} from '@/types/user';

// ─── Backend response shapes (snake_case) ─────────────────────────────────────

interface ApiPermission {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

interface ApiRole {
  id: string;
  name: string;
  display_name: string | null;
  description: string | null;
  is_system_role: boolean;
  permissions: ApiPermission[];
  created_at: string;
  updated_at: string;
}

interface ApiUserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login_at: string | null;
  must_change_password: boolean;
  department: string | null;
  roles: ApiRole[];
  created_at: string;
  updated_at: string;
}

interface ApiUserListItem {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  department: string | null;
  last_login_at: string | null;
  roles: string[];
}

interface ApiPaginatedUsers {
  items: ApiUserListItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

interface ApiPerformanceStats {
  cases_investigated: number;
  alerts_reviewed: number;
  fraud_cases_confirmed: number;
  total_fraud_amount_recovered: number;
  total_fraud_amount_display: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapRole(r: ApiRole): Role {
  return {
    id: r.id,
    name: r.name,
    displayName: r.display_name,
    description: r.description,
    isSystemRole: r.is_system_role,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    permissions: r.permissions.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
    })),
  };
}

function mapProfile(a: ApiUserProfile): UserProfile {
  return {
    id: a.id,
    email: a.email,
    fullName: a.full_name,
    phone: a.phone,
    isActive: a.is_active,
    isSuperuser: a.is_superuser,
    lastLoginAt: a.last_login_at,
    mustChangePassword: a.must_change_password,
    department: a.department,
    roles: a.roles.map(mapRole),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

function mapListItem(a: ApiUserListItem): UserListItem {
  return {
    id: a.id,
    email: a.email,
    fullName: a.full_name,
    isActive: a.is_active,
    isSuperuser: a.is_superuser,
    department: a.department,
    lastLoginAt: a.last_login_at,
    roles: a.roles,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const userService = {
  // ── Own profile ─────────────────────────────────────────────────────────────

  /** GET /api/v1/users/me */
  getMyProfile: async (): Promise<UserProfile> => {
    const data = await api.get<ApiUserProfile>('/users/me');
    return mapProfile(data);
  },
  /** PATCH /api/v1/users/me */
  updateMyProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> => {
    const data = await api.patch<ApiUserProfile>('/users/me', {
      full_name: payload.fullName,
      phone: payload.phone,
      department: payload.department,
    });
    return mapProfile(data);
  },
  /** GET /api/v1/users/me/stats */
  getMyStats: async (): Promise<UserPerformanceStats> => {
    const data = await api.get<ApiPerformanceStats>('/users/me/stats');
    return {
      casesInvestigated: data.cases_investigated,
      alertsReviewed: data.alerts_reviewed,
      fraudCasesConfirmed: data.fraud_cases_confirmed,
      totalFraudAmountRecovered: data.total_fraud_amount_recovered,
      totalFraudAmountDisplay: data.total_fraud_amount_display,
    };
  },
  /** PATCH /api/v1/auth/password */
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.patch('/auth/password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    });
  },

  // ── Admin: user management ───────────────────────────────────────────────────

  /**
   * GET /api/v1/users?page=N&page_size=N&is_active=true|false
   * Requires manage_users permission.
   */
  listUsers: async (
    params: {
      page?: number;
      pageSize?: number;
      isActive?: boolean | null;
      search?: string;
    } = {},
  ): Promise<PaginatedUsers> => {
    const query: Record<string, string | number | boolean> = {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
    };
    if (params.isActive !== undefined && params.isActive !== null) {
      query.is_active = params.isActive;
    }
    if (params.search) query.search = params.search;
    const data = await api.get<ApiPaginatedUsers>('/users', { params: query });
    return {
      items: data.items.map(mapListItem),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
      pages: data.pages,
    };
  },
  /**
   * GET /api/v1/users/:id
   * Returns full profile including nested permissions.
   */
  getUser: async (userId: string): Promise<UserProfile> => {
    const data = await api.get<ApiUserProfile>(`/users/${userId}`);
    return mapProfile(data);
  },
  /**
   * POST /api/v1/users
   * Admin creates a new user account.
   */
  createUser: async (payload: CreateUserPayload): Promise<UserProfile> => {
    const data = await api.post<ApiUserProfile>('/users', {
      email: payload.email,
      full_name: payload.fullName,
      phone: payload.phone,
      password: payload.password,
      role_ids: payload.roleIds,
      is_superuser: payload.isSuperuser ?? false,
      department: payload.department,
    });
    return mapProfile(data);
  },
  /**
   * PATCH /api/v1/users/:id
   * Admin updates full_name, phone, department, is_active.
   */
  updateUser: async (
    userId: string,
    payload: UpdateUserPayload,
  ): Promise<UserProfile> => {
    const data = await api.patch<ApiUserProfile>(`/users/${userId}`, {
      full_name: payload.fullName,
      phone: payload.phone,
      is_active: payload.isActive,
      department: payload.department,
    });
    return mapProfile(data);
  },
  /**
   * PATCH /api/v1/users/:id/roles
   * Replaces the user's entire role set.
   */
  assignRoles: async (
    userId: string,
    payload: AssignRolesPayload,
  ): Promise<UserProfile> => {
    const data = await api.patch<ApiUserProfile>(`/users/${userId}/roles`, {
      role_ids: payload.roleIds,
    });
    return mapProfile(data);
  },
  /**
   * PATCH /api/v1/users/:id/deactivate
   * Soft-deletes the account (sets is_active = false).
   */
  deactivateUser: async (userId: string): Promise<UserProfile> => {
    const data = await api.patch<ApiUserProfile>(`/users/${userId}/deactivate`);
    return mapProfile(data);
  },
  /**
   * GET /api/v1/roles
   * All available roles (for role-assignment dropdowns).
   */
  listRoles: async (): Promise<Role[]> => {
    const data = await api.get<ApiRole[]>('/roles');
    return data.map(mapRole);
  },
};
