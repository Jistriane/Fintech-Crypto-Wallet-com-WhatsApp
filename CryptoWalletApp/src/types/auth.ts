export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerificationData {
  phone: string;
  code: string;
}

export interface ResetPasswordData {
  phone: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  kycLevel: number;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
