import axios from 'axios';
import {
  SwapQuote,
  LiquidityPool,
  FarmingPool,
  AddLiquidityParams,
  RemoveLiquidityParams,
  StakeLPParams,
  UnstakeLPParams,
  ClaimRewardsParams,
} from '../types/defi';
import { Token } from '../types/wallet';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

class DeFiService {
  private static instance: DeFiService;
  private api = axios.create({
    baseURL: `${API_URL}/defi`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  private constructor() {}

  public static getInstance(): DeFiService {
    if (!DeFiService.instance) {
      DeFiService.instance = new DeFiService();
    }
    return DeFiService.instance;
  }

  public async getAvailableTokens(): Promise<Token[]> {
    try {
      const response = await this.api.get<{ tokens: Token[] }>('/tokens');
      return response.data.tokens;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getSwapQuote(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<SwapQuote> {
    try {
      const response = await this.api.get<{ quote: SwapQuote }>('/swap/quote', {
        params: {
          fromToken,
          toToken,
          amount,
        },
      });
      return response.data.quote;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async executeSwap(quote: SwapQuote): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/swap/execute', quote);
      return response.data.transactionHash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getLiquidityPools(): Promise<LiquidityPool[]> {
    try {
      const response = await this.api.get<{ pools: LiquidityPool[] }>('/pools');
      return response.data.pools;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getUserPools(): Promise<LiquidityPool[]> {
    try {
      const response = await this.api.get<{ pools: LiquidityPool[] }>('/pools/user');
      return response.data.pools;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getPoolDetails(poolId: string): Promise<LiquidityPool> {
    try {
      const response = await this.api.get<{ pool: LiquidityPool }>(`/pools/${poolId}`);
      return response.data.pool;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async addLiquidity(params: AddLiquidityParams): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/pools/add-liquidity', params);
      return response.data.transactionHash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async removeLiquidity(params: RemoveLiquidityParams): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/pools/remove-liquidity', params);
      return response.data.transactionHash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getFarmingPools(): Promise<FarmingPool[]> {
    try {
      const response = await this.api.get<{ pools: FarmingPool[] }>('/farming');
      return response.data.pools;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getUserFarms(): Promise<FarmingPool[]> {
    try {
      const response = await this.api.get<{ pools: FarmingPool[] }>('/farming/user');
      return response.data.pools;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getFarmDetails(farmId: string): Promise<FarmingPool> {
    try {
      const response = await this.api.get<{ pool: FarmingPool }>(`/farming/${farmId}`);
      return response.data.pool;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async stakeLPTokens(params: StakeLPParams): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/farming/stake', params);
      return response.data.transactionHash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async unstakeLPTokens(params: UnstakeLPParams): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/farming/unstake', params);
      return response.data.transactionHash;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async claimRewards(params: ClaimRewardsParams): Promise<string> {
    try {
      const response = await this.api.post<{ transactionHash: string }>('/farming/claim-rewards', params);
      return response.data.transactionHash;
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

export default DeFiService.getInstance();
