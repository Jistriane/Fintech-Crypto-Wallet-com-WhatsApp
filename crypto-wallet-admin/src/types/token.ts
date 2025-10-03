export interface Token {
  id: string;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  status: 'active' | 'inactive' | 'blocked';
  totalSupply: string;
  marketCap: number;
  price: {
    usd: number;
    brl: number;
    change24h: number;
  };
  volume24h: number;
  holders: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenTransaction {
  id: string;
  type: 'mint' | 'burn' | 'transfer';
  from: string;
  to: string;
  amount: string;
  usdValue: number;
  hash: string;
  status: 'pending' | 'completed' | 'failed';
  network: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface TokenStats {
  totalTokens: number;
  activeTokens: number;
  totalVolume24h: number;
  totalTransactions24h: number;
  averageTransactionValue: number;
  topNetworks: Array<{
    network: string;
    tokens: number;
    volume: number;
  }>;
}

export interface TokenFilters {
  status?: 'active' | 'inactive' | 'blocked';
  network?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  maxVolume?: number;
}
