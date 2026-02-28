export type UserRole = 'admin' | 'investigator' | 'analyst';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: UserRole[];
  is_superuser: boolean;
  must_change_password: boolean;
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
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
