export interface LiquidityPool {
  id: string;
  network: string;
  token0: {
    address: string;
    symbol: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
  };
  fee: number;
  tvl: number;
  volume24h: number;
  apy: number;
  totalSupply: string;
  reserve0: string;
  reserve1: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiquidityPosition {
  id: string;
  poolId: string;
  userId: string;
  amount: string;
  token0Amount: string;
  token1Amount: string;
  share: number;
  createdAt: string;
  updatedAt: string;
}

export interface LiquidityTransaction {
  id: string;
  poolId: string;
  userId: string;
  type: 'ADD' | 'REMOVE' | 'COLLECT_FEES';
  amount: string;
  token0Amount: string;
  token1Amount: string;
  hash: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
}

export interface LiquidityFilters {
  search?: string;
  network?: string;
  minTvl?: number;
  minApy?: number;
  token?: string;
}

export interface LiquiditySort {
  field: keyof LiquidityPool;
  direction: 'asc' | 'desc';
}

export interface LiquidityPagination {
  page: number;
  limit: number;
  total: number;
}

export interface LiquidityPoolsResponse {
  pools: LiquidityPool[];
  pagination: LiquidityPagination;
}

export interface LiquidityPositionsResponse {
  positions: LiquidityPosition[];
  pagination: LiquidityPagination;
}

export interface LiquidityTransactionsResponse {
  transactions: LiquidityTransaction[];
  pagination: LiquidityPagination;
}

export interface LiquidityPoolStats {
  tvl: number;
  volume24h: number;
  apy: number;
  transactions24h: number;
  uniqueUsers24h: number;
  volumeHistory: {
    date: string;
    volume: number;
  }[];
  tvlHistory: {
    date: string;
    tvl: number;
  }[];
  apyHistory: {
    date: string;
    apy: number;
  }[];
}

export interface LiquidityPoolDetails {
  pool: LiquidityPool;
  stats: LiquidityPoolStats;
  positions: LiquidityPosition[];
  transactions: LiquidityTransaction[];
}

export interface AddLiquidityData {
  poolId: string;
  token0Amount: string;
  token1Amount: string;
}

export interface RemoveLiquidityData {
  poolId: string;
  positionId: string;
  amount: string;
}

export interface CollectFeesData {
  poolId: string;
  positionId: string;
}
