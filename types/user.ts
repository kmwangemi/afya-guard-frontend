export type UserRole = 'admin' | 'investigator' | 'analyst';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string; // UUID
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  profile_picture_url: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
