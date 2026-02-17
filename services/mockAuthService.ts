import { LoginRequest, LoginResponse, User } from '@/types/user';

const MOCK_USER: User = {
  id: 'user_001',
  email: 'investigator@sha.go.ke',
  first_name: 'Jane',
  last_name: 'Wanjiru',
  role: 'investigator',
  status: 'active',
  phone_number: '+254712345678',
  created_at: new Date('2023-01-15').toISOString(),
  updated_at: new Date('2024-02-13').toISOString(),
  profile_picture_url: null,
};

export const mockAuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // Basic validation
    if (!credentials.username || !credentials.password) {
      throw new Error('Invalid credentials');
    }
    // Mock validation - accept any email/password combination for demo
    if (
      credentials.username !== 'demo@sha.go.ke' &&
      !credentials.username.includes('@sha.go.ke')
    ) {
      throw new Error('Invalid email or password');
    }
    const mockToken = 'mock_token_' + Date.now();
    return {
      user: MOCK_USER,
      token: mockToken,
      refreshToken: 'mock_refresh_token',
      expiresIn: 3600,
    };
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USER;
  },
};
