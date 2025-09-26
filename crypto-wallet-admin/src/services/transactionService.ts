import axios from 'axios';
import {
  Transaction,
  TransactionFilters,
  TransactionSort,
  TransactionsResponse,
  TransactionStats,
  TransactionDetails,
} from '@/types/transactions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const TRANSACTIONS_API = `${API_URL}/api/transactions`;

class TransactionService {
  private static instance: TransactionService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getTransactions(
    filters?: TransactionFilters,
    sort?: TransactionSort,
    page = 1,
    limit = 10
  ): Promise<TransactionsResponse> {
    try {
      const response = await axios.get(TRANSACTIONS_API, {
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

  public async getTransactionById(transactionId: string): Promise<TransactionDetails> {
    try {
      const response = await axios.get(`${TRANSACTIONS_API}/${transactionId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactionStats(): Promise<TransactionStats> {
    try {
      const response = await axios.get(`${TRANSACTIONS_API}/stats`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getTransactionsByWallet(
    walletId: string,
    filters?: Omit<TransactionFilters, 'walletId'>,
    sort?: TransactionSort,
    page = 1,
    limit = 10
  ): Promise<TransactionsResponse> {
    try {
      const response = await axios.get(`${TRANSACTIONS_API}/wallet/${walletId}`, {
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

  public async getTransactionsByUser(
    userId: string,
    filters?: Omit<TransactionFilters, 'userId'>,
    sort?: TransactionSort,
    page = 1,
    limit = 10
  ): Promise<TransactionsResponse> {
    try {
      const response = await axios.get(`${TRANSACTIONS_API}/user/${userId}`, {
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

export default TransactionService;
