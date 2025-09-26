import axios from 'axios';
import {
  Token,
  TokenBalance,
  Transaction,
  TransactionDetails,
  SendTokenData,
  SwapTokenData,
  AddLiquidityData,
  RemoveLiquidityData,
  FarmData,
} from '@/types/wallet';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const WALLET_API = `${API_URL}/wallet`;

class WalletService {
  private static instance: WalletService;
  private token: string | null = null;

  private constructor() {}

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

  public setToken(token: string) {
    this.token = token;
  }

  public async getWalletAddress(): Promise<string> {
    try {
      const response = await axios.get(`${WALLET_API}/address`, {
        headers: this.getHeaders(),
      });
      return response.data.address;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTokenBalances(): Promise<TokenBalance[]> {
    try {
      const response = await axios.get(`${WALLET_API}/balances`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactions(page = 1, limit = 10): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${WALLET_API}/transactions`, {
        params: { page, limit },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactionById(transactionId: string): Promise<TransactionDetails> {
    try {
      const response = await axios.get(`${WALLET_API}/transactions/${transactionId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async sendToken(data: SendTokenData): Promise<Transaction> {
    try {
      const response = await axios.post(`${WALLET_API}/send`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async swapTokens(data: SwapTokenData): Promise<Transaction> {
    try {
      const response = await axios.post(`${WALLET_API}/swap`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async addLiquidity(data: AddLiquidityData): Promise<Transaction> {
    try {
      const response = await axios.post(`${WALLET_API}/liquidity/add`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async removeLiquidity(data: RemoveLiquidityData): Promise<Transaction> {
    try {
      const response = await axios.post(`${WALLET_API}/liquidity/remove`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async farm(data: FarmData): Promise<Transaction> {
    try {
      const response = await axios.post(`${WALLET_API}/farm`, data, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTokens(): Promise<Token[]> {
    try {
      const response = await axios.get(`${WALLET_API}/tokens`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTokenByAddress(address: string): Promise<Token> {
    try {
      const response = await axios.get(`${WALLET_API}/tokens/${address}`, {
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
