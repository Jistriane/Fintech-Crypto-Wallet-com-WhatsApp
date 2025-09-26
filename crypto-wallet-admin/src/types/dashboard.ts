export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalWallets: number;
  totalTransactions: number;
  totalVolume: number;
  kycStats: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  };
  networkStats: {
    ethereum: number;
    polygon: number;
    bsc: number;
    arbitrum: number;
  };
}

export interface TransactionStats {
  daily: {
    date: string;
    count: number;
    volume: number;
  }[];
  weekly: {
    week: string;
    count: number;
    volume: number;
  }[];
  monthly: {
    month: string;
    count: number;
    volume: number;
  }[];
}

export interface UserStats {
  registrations: {
    date: string;
    count: number;
  }[];
  kycProgress: {
    date: string;
    level0: number;
    level1: number;
    level2: number;
    level3: number;
  }[];
  retention: {
    date: string;
    rate: number;
  }[];
}

export interface WalletStats {
  networkDistribution: {
    network: string;
    count: number;
  }[];
  balanceDistribution: {
    range: string;
    count: number;
  }[];
  activityDistribution: {
    range: string;
    count: number;
  }[];
}

export interface LiquidityStats {
  totalLiquidity: number;
  pools: {
    pool: string;
    liquidity: number;
    volume24h: number;
    apy: number;
  }[];
  volumeHistory: {
    date: string;
    volume: number;
  }[];
}

export interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  responseRate: number;
  history: {
    date: string;
    sent: number;
    delivered: number;
    responded: number;
  }[];
}
