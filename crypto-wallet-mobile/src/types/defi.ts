export interface SwapQuote {
  fromToken: {
    address: string;
    symbol: string;
    decimals: number;
    amount: string;
  };
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
    amount: string;
  };
  route: {
    path: string[];
    pools: string[];
  };
  priceImpact: number;
  fee: string;
  gas: string;
  expiresAt: string;
}

export interface LiquidityPool {
  id: string;
  network: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
    reserve: string;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
    reserve: string;
  };
  fee: number;
  tvl: number;
  volume24h: number;
  apy: number;
  totalSupply: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiquidityPosition {
  id: string;
  poolId: string;
  token0Amount: string;
  token1Amount: string;
  share: number;
  value: number;
  apy: number;
  rewards: {
    token: {
      address: string;
      symbol: string;
      decimals: number;
    };
    amount: string;
    value: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  network: string;
  name: string;
  description: string;
  pool: LiquidityPool;
  rewardToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  totalStaked: string;
  apy: number;
  tvl: number;
  minStake: string;
  maxStake: string;
  lockPeriod: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmPosition {
  id: string;
  farmId: string;
  stakedAmount: string;
  pendingRewards: string;
  value: number;
  apy: number;
  unlockDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeFiState {
  pools: LiquidityPool[];
  positions: LiquidityPosition[];
  farms: Farm[];
  farmPositions: FarmPosition[];
  selectedPool: LiquidityPool | null;
  selectedFarm: Farm | null;
  isLoading: boolean;
  error: string | null;
}

export interface SwapData {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage: number;
}

export interface AddLiquidityData {
  poolId: string;
  token0Amount: string;
  token1Amount: string;
  slippage: number;
}

export interface RemoveLiquidityData {
  poolId: string;
  positionId: string;
  liquidity: string;
  slippage: number;
}

export interface StakeData {
  farmId: string;
  amount: string;
}

export interface UnstakeData {
  farmId: string;
  positionId: string;
  amount: string;
}

export interface ClaimRewardsData {
  farmId: string;
  positionId: string;
}
