import { api } from '@/lib/api';
import {
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserPerformanceStats,
  UserProfile,
} from '@/types/user';

// ─── Backend response shapes ──────────────────────────────────────────────────

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

interface ApiPerformanceStats {
  cases_investigated: number;
  alerts_reviewed: number;
  fraud_cases_confirmed: number;
  total_fraud_amount_recovered: number;
  total_fraud_amount_display: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

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
    roles: a.roles.map(r => ({
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
    })),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const userService = {
  // GET /api/v1/users/profile
  getMyProfile: async (): Promise<UserProfile> => {
    const data = await api.get<ApiUserProfile>('/users/profile');
    return mapProfile(data);
  },
  // PATCH /api/v1/users/profile  — full_name, phone, department only
  updateMyProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> => {
    const data = await api.patch<ApiUserProfile>('/users/profile', {
      full_name: payload.fullName,
      phone: payload.phone,
      department: payload.department,
    });
    return mapProfile(data);
  },
  // GET /api/v1/users/me/stats
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
  // PATCH /api/v1/auth/password
  changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
    await api.patch('/auth/password', {
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      confirm_password: payload.confirmPassword,
    });
  },
};
