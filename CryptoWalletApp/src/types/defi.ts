import { Token } from './wallet';

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  exchangeRate: string;
  priceImpact: string;
  fee: string;
  estimatedGas: string;
  slippage: string;
  minReceived: string;
  route: {
    path: Token[];
    protocol: string;
  }[];
}

export interface LiquidityPool {
  id: string;
  token0: Token;
  token1: Token;
  totalLiquidity: string;
  totalLiquidityUSD: string;
  volume24h: string;
  volume24hUSD: string;
  fee: string;
  apy: string;
  userLiquidity?: {
    token0Amount: string;
    token1Amount: string;
    shareOfPool: string;
    valueUSD: string;
  };
}

export interface FarmingPool {
  id: string;
  name: string;
  poolTokens: [Token, Token];
  rewardToken: Token;
  totalStaked: string;
  totalStakedUSD: string;
  apy: string;
  rewards24h: string;
  userStaked?: {
    lpTokens: string;
    valueUSD: string;
    pendingRewards: string;
    shareOfPool: string;
  };
  lockPeriod?: {
    days: number;
    multiplier: string;
  };
}

export interface DeFiState {
  availableTokens: Token[];
  popularPools: LiquidityPool[];
  userPools: LiquidityPool[];
  farmingPools: FarmingPool[];
  selectedPool: LiquidityPool | null;
  selectedFarm: FarmingPool | null;
  isLoading: boolean;
  error: string | null;
}

export interface AddLiquidityParams {
  poolId: string;
  token0Amount: string;
  token1Amount: string;
  slippage: string;
}

export interface RemoveLiquidityParams {
  poolId: string;
  lpTokens: string;
  minToken0: string;
  minToken1: string;
  slippage: string;
}

export interface StakeLPParams {
  farmId: string;
  lpTokens: string;
}

export interface UnstakeLPParams {
  farmId: string;
  lpTokens: string;
}

export interface ClaimRewardsParams {
  farmId: string;
}
