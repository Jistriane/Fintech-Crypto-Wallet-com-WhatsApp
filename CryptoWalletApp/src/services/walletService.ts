import axios from 'axios';
import { Wallet, Token, Transaction, SendTokenData, SwapTokenData, AddLiquidityData, RemoveLiquidityData } from '../types/wallet';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class WalletService {
  private static instance: WalletService;
  private api = axios.create({
    baseURL: `${API_URL}/wallet`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  public async getWallets(): Promise<Wallet[]> {
    try {
      const response = await this.api.get<{ wallets: Wallet[] }>('/');
      return response.data.wallets;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getWallet(walletId: string): Promise<Wallet> {
    try {
      const response = await this.api.get<{ wallet: Wallet }>(`/${walletId}`);
      return response.data.wallet;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTokens(walletId: string): Promise<Token[]> {
    try {
      const response = await this.api.get<{ tokens: Token[] }>(`/${walletId}/tokens`);
      return response.data.tokens;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getToken(walletId: string, tokenId: string): Promise<Token> {
    try {
      const response = await this.api.get<{ token: Token }>(`/${walletId}/tokens/${tokenId}`);
      return response.data.token;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTransactions(walletId: string): Promise<Transaction[]> {
    try {
      const response = await this.api.get<{ transactions: Transaction[] }>(`/${walletId}/transactions`);
      return response.data.transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTransaction(walletId: string, transactionId: string): Promise<Transaction> {
    try {
      const response = await this.api.get<{ transaction: Transaction }>(`/${walletId}/transactions/${transactionId}`);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async sendToken(data: SendTokenData): Promise<Transaction> {
    try {
      const response = await this.api.post<{ transaction: Transaction }>(`/${data.walletId}/send`, data);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async swapToken(data: SwapTokenData): Promise<Transaction> {
    try {
      const response = await this.api.post<{ transaction: Transaction }>(`/${data.walletId}/swap`, data);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async addLiquidity(data: AddLiquidityData): Promise<Transaction> {
    try {
      const response = await this.api.post<{ transaction: Transaction }>(`/${data.walletId}/liquidity/add`, data);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async removeLiquidity(data: RemoveLiquidityData): Promise<Transaction> {
    try {
      const response = await this.api.post<{ transaction: Transaction }>(`/${data.walletId}/liquidity/remove`, data);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTransactionStatus(walletId: string, transactionId: string): Promise<Transaction> {
    try {
      const response = await this.api.get<{ transaction: Transaction }>(`/${walletId}/transactions/${transactionId}/status`);
      return response.data.transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Erro ao processar a requisição';
      return new Error(message);
    }
    return error;
  }
}

export default WalletService.getInstance();
