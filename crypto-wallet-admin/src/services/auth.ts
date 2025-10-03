import api, { setAuthToken, clearAuthToken, handleApiError } from './api';
import type { AuthResponse, LoginCredentials, TwoFactorVerification, User } from '@/types/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      if (!data.requires2FA) {
        setAuthToken(data.token);
      }
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async verify2FA(verification: TwoFactorVerification): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/verify-2fa', verification);
      setAuthToken(data.token);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      clearAuthToken();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async getProfile(): Promise<User> {
    try {
      const { data } = await api.get<User>('/auth/me');
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>('/auth/refresh');
      setAuthToken(data.token);
      return data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
