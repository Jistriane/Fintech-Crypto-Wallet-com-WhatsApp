import axios from 'axios';
import {
  SwapQuote,
  LiquidityPool,
  LiquidityPosition,
  Farm,
  FarmPosition,
  SwapData,
  AddLiquidityData,
  RemoveLiquidityData,
  StakeData,
  UnstakeData,
  ClaimRewardsData,
} from '@/types/defi';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const DEFI_API = `${API_URL}/defi`;

class DeFiService {
  private static instance: DeFiService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): DeFiService {
    if (!DeFiService.instance) {
      DeFiService.instance = new DeFiService();
    }
    return DeFiService.instance;
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

  public async getSwapQuote(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<SwapQuote> {
    try {
      const response = await axios.get(`${DEFI_API}/swap/quote`, {
        params: { fromToken, toToken, amount },
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async swap(data: SwapData): Promise<void> {
    try {
      await axios.post(`${DEFI_API}/swap`, data, {
        headers: this.getHeaders(),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityPools(): Promise<LiquidityPool[]> {
    try {
      const response = await axios.get(`${DEFI_API}/pools`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityPool(poolId: string): Promise<LiquidityPool> {
    try {
      const response = await axios.get(`${DEFI_API}/pools/${poolId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityPositions(): Promise<LiquidityPosition[]> {
    try {
      const response = await axios.get(`${DEFI_API}/positions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async addLiquidity(data: AddLiquidityData): Promise<void> {
    try {
      await axios.post(`${DEFI_API}/pools/${data.poolId}/add`, data, {
        headers: this.getHeaders(),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async removeLiquidity(data: RemoveLiquidityData): Promise<void> {
    try {
      await axios.post(
        `${DEFI_API}/pools/${data.poolId}/positions/${data.positionId}/remove`,
        data,
        { headers: this.getHeaders() }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getFarms(): Promise<Farm[]> {
    try {
      const response = await axios.get(`${DEFI_API}/farms`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getFarm(farmId: string): Promise<Farm> {
    try {
      const response = await axios.get(`${DEFI_API}/farms/${farmId}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async getFarmPositions(): Promise<FarmPosition[]> {
    try {
      const response = await axios.get(`${DEFI_API}/farm-positions`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async stake(data: StakeData): Promise<void> {
    try {
      await axios.post(`${DEFI_API}/farms/${data.farmId}/stake`, data, {
        headers: this.getHeaders(),
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async unstake(data: UnstakeData): Promise<void> {
    try {
      await axios.post(
        `${DEFI_API}/farms/${data.farmId}/positions/${data.positionId}/unstake`,
        data,
        { headers: this.getHeaders() }
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  public async claimRewards(data: ClaimRewardsData): Promise<void> {
    try {
      await axios.post(
        `${DEFI_API}/farms/${data.farmId}/positions/${data.positionId}/claim`,
        data,
        { headers: this.getHeaders() }
      );
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

export default DeFiService;
