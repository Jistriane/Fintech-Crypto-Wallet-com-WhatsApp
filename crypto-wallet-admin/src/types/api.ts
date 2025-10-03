export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  requires2FA: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TwoFactorVerification {
  code: string;
  token: string;
}
