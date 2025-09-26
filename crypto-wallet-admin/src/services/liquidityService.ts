import axios from 'axios';
import {
  LiquidityPool,
  LiquidityFilters,
  LiquiditySort,
  LiquidityPoolsResponse,
  LiquidityPositionsResponse,
  LiquidityTransactionsResponse,
  LiquidityPoolDetails,
  AddLiquidityData,
  RemoveLiquidityData,
  CollectFeesData,
} from '@/types/liquidity';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const LIQUIDITY_API = `${API_URL}/api/liquidity`;

class LiquidityService {
  private static instance: LiquidityService;
  private token: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  public static getInstance(): LiquidityService {
    if (!LiquidityService.instance) {
      LiquidityService.instance = new LiquidityService();
    }
    return LiquidityService.instance;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  public async getLiquidityPools(
    filters?: LiquidityFilters,
    sort?: LiquiditySort,
    page = 1,
    limit = 10
  ): Promise<LiquidityPoolsResponse> {
    try {
      const response = await axios.get(`${LIQUIDITY_API}/pools`, {
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

  public async getLiquidityPoolById(poolId: string): Promise<LiquidityPoolDetails> {
    try {
      const response = await axios.get(`${LIQUIDITY_API}/pools/${poolId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityPositions(
    userId?: string,
    poolId?: string,
    page = 1,
    limit = 10
  ): Promise<LiquidityPositionsResponse> {
    try {
      const response = await axios.get(`${LIQUIDITY_API}/positions`, {
        params: {
          userId,
          poolId,
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

  public async getLiquidityTransactions(
    userId?: string,
    poolId?: string,
    page = 1,
    limit = 10
  ): Promise<LiquidityTransactionsResponse> {
    try {
      const response = await axios.get(`${LIQUIDITY_API}/transactions`, {
        params: {
          userId,
          poolId,
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

  public async addLiquidity(data: AddLiquidityData): Promise<LiquidityPool> {
    try {
      const response = await axios.post(
        `${LIQUIDITY_API}/pools/${data.poolId}/add`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async removeLiquidity(data: RemoveLiquidityData): Promise<LiquidityPool> {
    try {
      const response = await axios.post(
        `${LIQUIDITY_API}/pools/${data.poolId}/remove`,
        data,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async collectFees(data: CollectFeesData): Promise<LiquidityPool> {
    try {
      const response = await axios.post(
        `${LIQUIDITY_API}/pools/${data.poolId}/collect-fees`,
        data,
        { headers: this.getHeaders() }
      );
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

export default LiquidityService;
