import axios from 'axios';
import {
  Wallet,
  TokenBalance,
  WalletTransaction,
  WalletFilters,
  WalletSort,
  WalletsResponse,
  WalletStats,
  WalletActivity,
  CreateWalletData,
  UpdateWalletData,
} from '@/types/wallets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WALLETS_API = `${API_URL}/api/wallets`;

class WalletService {
  private static instance: WalletService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getWallets(
    filters?: WalletFilters,
    sort?: WalletSort,
    page = 1,
    limit = 10
  ): Promise<WalletsResponse> {
    try {
      const response = await axios.get(WALLETS_API, {
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

  public async getWalletById(walletId: string): Promise<Wallet> {
    try {
      const response = await axios.get(`${WALLETS_API}/${walletId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletBalances(walletId: string): Promise<TokenBalance[]> {
    try {
      const response = await axios.get(`${WALLETS_API}/${walletId}/balances`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletTransactions(walletId: string): Promise<WalletTransaction[]> {
    try {
      const response = await axios.get(`${WALLETS_API}/${walletId}/transactions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletActivity(walletId: string): Promise<WalletActivity[]> {
    try {
      const response = await axios.get(`${WALLETS_API}/${walletId}/activity`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getWalletStats(): Promise<WalletStats> {
    try {
      const response = await axios.get(`${WALLETS_API}/stats`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async createWallet(data: CreateWalletData): Promise<Wallet> {
    try {
      const response = await axios.post(WALLETS_API, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async updateWallet(walletId: string, data: UpdateWalletData): Promise<Wallet> {
    try {
      const response = await axios.put(`${WALLETS_API}/${walletId}`, data, {
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

export default WalletService;
