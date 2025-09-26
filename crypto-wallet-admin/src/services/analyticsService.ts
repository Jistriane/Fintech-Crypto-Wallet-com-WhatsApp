import axios from 'axios';
import {
  AnalyticsFilters,
  AnalyticsData,
  UserAnalytics,
  TransactionAnalytics,
  WalletAnalytics,
  LiquidityAnalytics,
  NotificationAnalytics,
  SystemAnalytics,
} from '@/types/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ANALYTICS_API = `${API_URL}/api/analytics`;

class AnalyticsService {
  private static instance: AnalyticsService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    try {
      const response = await axios.get(ANALYTICS_API, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getUserAnalytics(filters?: AnalyticsFilters): Promise<UserAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/users`, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactionAnalytics(filters?: AnalyticsFilters): Promise<TransactionAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/transactions`, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletAnalytics(filters?: AnalyticsFilters): Promise<WalletAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/wallets`, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityAnalytics(filters?: AnalyticsFilters): Promise<LiquidityAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/liquidity`, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getNotificationAnalytics(filters?: AnalyticsFilters): Promise<NotificationAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/notifications`, {
        params: filters,
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getSystemAnalytics(filters?: AnalyticsFilters): Promise<SystemAnalytics> {
    try {
      const response = await axios.get(`${ANALYTICS_API}/system`, {
        params: filters,
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

export default AnalyticsService;
