import axios from 'axios';
import {
  User,
  UserFilters,
  UserSort,
  UsersResponse,
  CreateUserData,
  UpdateUserData,
  UpdateUserKYCData,
  UserActivity,
  UserStats,
} from '@/types/users';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const USERS_API = `${API_URL}/api/users`;

class UserService {
  private static instance: UserService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getUsers(
    filters?: UserFilters,
    sort?: UserSort,
    page = 1,
    limit = 10
  ): Promise<UsersResponse> {
    try {
      const response = await axios.get(USERS_API, {
        params: {
          ...filters,
          sortField: sort?.field,
          sortDirection: sort?.direction,
          page,
          limit,
        },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getUserById(userId: string): Promise<User> {
    try {
      const response = await axios.get(`${USERS_API}/${userId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async createUser(data: CreateUserData): Promise<User> {
    try {
      const response = await axios.post(USERS_API, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    try {
      const response = await axios.put(`${USERS_API}/${userId}`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateUserKYC(userId: string, data: UpdateUserKYCData): Promise<User> {
    try {
      const response = await axios.put(`${USERS_API}/${userId}/kyc`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getUserActivity(userId: string): Promise<UserActivity[]> {
    try {
      const response = await axios.get(`${USERS_API}/${userId}/activity`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getUserStats(): Promise<UserStats> {
    try {
      const response = await axios.get(`${USERS_API}/stats`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
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

export default UserService;
