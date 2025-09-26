import axios from 'axios';
import {
  LoginCredentials,
  LoginResponse,
  ResetPasswordCredentials,
  ChangePasswordCredentials,
  UpdateProfileData,
  TwoFactorAuthCredentials,
  User,
} from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_API = `${API_URL}/api/auth`;

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Recuperar token do localStorage no lado do cliente
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${AUTH_API}/login`, credentials);
      const { token, user } = response.data;
      
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      this.token = token;

      return { token, user };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await axios.post(`${AUTH_API}/logout`, {}, { headers: this.getHeaders() });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar token e localStorage
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    }
  }

  public async verifyTwoFactor(credentials: TwoFactorAuthCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${AUTH_API}/verify-2fa`, credentials);
      const { token, user } = response.data;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      this.token = token;

      return { token, user };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
    try {
      await axios.post(`${AUTH_API}/reset-password`, credentials);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async changePassword(credentials: ChangePasswordCredentials): Promise<void> {
    try {
      await axios.post(
        `${AUTH_API}/change-password`,
        credentials,
        { headers: this.getHeaders() }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await axios.put(
        `${AUTH_API}/profile`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(
        `${AUTH_API}/me`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'Ocorreu um erro na autenticação';
      const customError = new Error(message);
      customError.name = error.response.status.toString();
      return customError;
    }
    return new Error('Erro de conexão com o servidor');
  }
}
