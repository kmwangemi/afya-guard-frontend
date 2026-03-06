export type UserRole = 'admin' | 'investigator' | 'analyst';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserLoginResponse {
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  must_change_password: boolean;
  roles: UserRole[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  tokens: LoginTokens;
  user: UserLoginResponse;
}

export interface AuthState {
  user: UserLoginResponse | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── User / profile domain types ─────────────────────────────────────────────
// Aligned to backend UserResponse, UserProfileUpdate, UserPerformanceStats

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface Role {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  isSystemRole: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// Full profile — GET /users/me
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  department: string | null;
  roles: Role[];
  createdAt: string; // Fix 2: IS returned by /users/profile via TimestampMixin
  updatedAt: string;
}

// PATCH /users/profile — only full_name, phone, department are editable
export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  department?: string;
}

// GET /users/profile/stats — Fix 1: replaces hardcoded stat values
export interface UserPerformanceStats {
  casesInvestigated: number;
  alertsReviewed: number;
  fraudCasesConfirmed: number;
  totalFraudAmountRecovered: number;
  totalFraudAmountDisplay: string; // pre-formatted "KES 2.4M"
}

// PATCH /auth/password
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
