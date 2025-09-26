export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  network?: string;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  registrationTrend: {
    date: string;
    count: number;
  }[];
  retentionRate: {
    date: string;
    rate: number;
  }[];
  kycDistribution: {
    level: number;
    count: number;
  }[];
  usersByNetwork: {
    network: string;
    count: number;
  }[];
  userActivity: {
    date: string;
    activeUsers: number;
    newUsers: number;
    churned: number;
  }[];
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalVolume: number;
  averageTransactionValue: number;
  transactionTrend: {
    date: string;
    count: number;
    volume: number;
  }[];
  transactionsByType: {
    type: string;
    count: number;
    volume: number;
  }[];
  transactionsByNetwork: {
    network: string;
    count: number;
    volume: number;
  }[];
  failureRate: {
    date: string;
    rate: number;
    count: number;
  }[];
  gasUsage: {
    date: string;
    average: number;
    total: number;
  }[];
}

export interface WalletAnalytics {
  totalWallets: number;
  activeWallets: number;
  walletCreationTrend: {
    date: string;
    count: number;
  }[];
  walletsByNetwork: {
    network: string;
    count: number;
  }[];
  balanceDistribution: {
    range: string;
    count: number;
    totalBalance: number;
  }[];
  activityDistribution: {
    range: string;
    count: number;
  }[];
  tokenDistribution: {
    token: string;
    holders: number;
    totalBalance: number;
  }[];
}

export interface LiquidityAnalytics {
  totalLiquidity: number;
  totalPools: number;
  liquidityTrend: {
    date: string;
    liquidity: number;
    volume: number;
  }[];
  poolsByNetwork: {
    network: string;
    count: number;
    liquidity: number;
  }[];
  topPools: {
    pool: string;
    liquidity: number;
    volume24h: number;
    apy: number;
  }[];
  volumeDistribution: {
    range: string;
    count: number;
    volume: number;
  }[];
  apyDistribution: {
    range: string;
    count: number;
  }[];
}

export interface NotificationAnalytics {
  totalNotifications: number;
  deliveryRate: number;
  responseRate: number;
  notificationTrend: {
    date: string;
    sent: number;
    delivered: number;
    responded: number;
  }[];
  notificationsByType: {
    type: string;
    count: number;
    deliveryRate: number;
    responseRate: number;
  }[];
  deliveryTime: {
    range: string;
    count: number;
  }[];
  failureReasons: {
    reason: string;
    count: number;
  }[];
}

export interface SystemAnalytics {
  apiUsage: {
    date: string;
    requests: number;
    errors: number;
  }[];
  responseTime: {
    date: string;
    average: number;
    p95: number;
    p99: number;
  }[];
  errorRate: {
    date: string;
    rate: number;
    count: number;
  }[];
  resourceUsage: {
    date: string;
    cpu: number;
    memory: number;
    storage: number;
  }[];
  networkUsage: {
    date: string;
    inbound: number;
    outbound: number;
  }[];
}

export interface AnalyticsData {
  user: UserAnalytics;
  transaction: TransactionAnalytics;
  wallet: WalletAnalytics;
  liquidity: LiquidityAnalytics;
  notification: NotificationAnalytics;
  system: SystemAnalytics;
}
