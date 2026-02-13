import { User, LoginRequest, LoginResponse } from "@/types/user";

const MOCK_USER: User = {
  id: "user_001",
  email: "investigator@sha.go.ke",
  firstName: "Jane",
  lastName: "Wanjiru",
  fullName: "Jane Wanjiru",
  role: "investigator",
  status: "active",
  department: "Fraud Investigation Unit",
  phone: "+254712345678",
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-02-13"),
  lastLogin: new Date("2024-02-13"),
  permissions: [
    "view_claims",
    "view_providers",
    "view_alerts",
    "create_investigation",
    "update_investigation",
    "view_reports",
  ],
};

export const mockAuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic validation
    if (!credentials.email || !credentials.password) {
      throw new Error("Invalid credentials");
    }

    // Mock validation - accept any email/password combination for demo
    if (credentials.email !== "demo@sha.go.ke" && !credentials.email.includes("@sha.go.ke")) {
      throw new Error("Invalid email or password");
    }

    const mockToken = "mock_token_" + Date.now();

    return {
      user: MOCK_USER,
      token: mockToken,
      refreshToken: "mock_refresh_token",
      expiresIn: 3600,
    };
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_USER;
  },
};
