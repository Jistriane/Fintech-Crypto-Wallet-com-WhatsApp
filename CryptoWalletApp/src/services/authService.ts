import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, VerificationData, ResetPasswordData, AuthResponse } from '../types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

class AuthService {
  private static instance: AuthService;
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {
    this.setupInterceptors();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
            const response = await this.api.post('/auth/refresh-token', {
              refreshToken,
            });

            const { token } = response.data;
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      await this.saveTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', data);
      await this.saveTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async verifyPhone(data: VerificationData): Promise<void> {
    try {
      await this.api.post('/auth/verify-phone', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async resendVerificationCode(phone: string): Promise<void> {
    try {
      await this.api.post('/auth/resend-code', { phone });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async requestPasswordReset(phone: string): Promise<void> {
    try {
      await this.api.post('/auth/request-reset', { phone });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await this.api.post('/auth/reset-password', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      await this.clearTokens();
    }
  }

  public async checkAuth(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  private async saveTokens(token: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Erro ao processar a requisição';
      return new Error(message);
    }
    return error;
  }
}

export default AuthService.getInstance();
