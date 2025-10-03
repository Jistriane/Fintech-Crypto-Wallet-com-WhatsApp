export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalWallets: number;
  activeWallets: number;
  totalTransactions: number;
  totalVolume: string;
  totalVolumeUSD: number;
  userGrowth: number;
  transactionGrowth: number;
}

export interface ChartData {
  date: string;
  newUsers: number;
  activeUsers: number;
  transactions: number;
  volume: number;
}

export interface TokenMetrics {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
}

export interface NetworkMetrics {
  network: string;
  transactions: number;
  volume: number;
  activeWallets: number;
  gasUsed: number;
}

export interface WhatsAppMetrics {
  totalConversations: number;
  activeConversations: number;
  averageResponseTime: number;
  successRate: number;
}
