export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  kycLevel: number;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  walletAddress: string;
  createdAt: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  name: string;
}

export interface VerifyCodeData {
  code: string;
  type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD';
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  code: string;
  newPassword: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
