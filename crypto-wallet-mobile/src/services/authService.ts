import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {
  LoginCredentials,
  RegisterData,
  VerifyCodeData,
  ResetPasswordData,
  UpdatePasswordData,
  LoginResponse,
  User,
} from '@/types/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_API = `${API_URL}/auth`;

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async getHeaders() {
    if (!this.token) {
      this.token = await SecureStore.getItemAsync('token');
    }

    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${AUTH_API}/login`, credentials);
      const { token, user } = response.data;
      await this.setToken(token);
      return { token, user };
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async register(data: RegisterData): Promise<void> {
    try {
      await axios.post(`${AUTH_API}/register`, data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async verifyCode(data: VerifyCodeData): Promise<LoginResponse | void> {
    try {
      const response = await axios.post(`${AUTH_API}/verify-code`, data);
      if (data.type === 'LOGIN' || data.type === 'REGISTER') {
        const { token, user } = response.data;
        await this.setToken(token);
        return { token, user };
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      await axios.post(`${AUTH_API}/reset-password`, data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updatePassword(data: UpdatePasswordData): Promise<void> {
    try {
      await axios.post(`${AUTH_API}/update-password`, data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getProfile(): Promise<User> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${AUTH_API}/profile`, { headers });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.clearToken();
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private async setToken(token: string): Promise<void> {
    this.token = token;
    await SecureStore.setItemAsync('token', token);
  }

  private async clearToken(): Promise<void> {
    this.token = null;
    await SecureStore.deleteItemAsync('token');
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'Erro ao processar requisição';
      const customError = new Error(message);
      customError.name = error.response.status.toString();
      return customError;
    }
    return new Error('Erro de conexão com o servidor');
  }
}

export default AuthService;
