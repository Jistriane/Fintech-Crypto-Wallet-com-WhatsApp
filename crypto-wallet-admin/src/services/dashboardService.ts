import axios from 'axios';
import {
  DashboardStats,
  TransactionStats,
  UserStats,
  WalletStats,
  LiquidityStats,
  NotificationStats,
} from '@/types/dashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DASHBOARD_API = `${API_URL}/api/dashboard`;

class DashboardService {
  private static instance: DashboardService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/stats`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactionStats(period: 'daily' | 'weekly' | 'monthly'): Promise<TransactionStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/transactions`, {
        params: { period },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getUserStats(): Promise<UserStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/users`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletStats(): Promise<WalletStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/wallets`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityStats(): Promise<LiquidityStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/liquidity`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await axios.get(`${DASHBOARD_API}/notifications`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data.message || 'Erro ao buscar dados do dashboard';
      const customError = new Error(message);
      customError.name = error.response.status.toString();
      return customError;
    }
    return new Error('Erro de conexão com o servidor');
  }
}

export default DashboardService;
