export interface Wallet {
  id: string;
  address: string;
  network: string;
  status: 'active' | 'inactive' | 'blocked';
  balance: {
    native: string;
    usd: number;
    tokens: {
      [symbol: string]: {
        balance: string;
        usdValue: number;
      };
    };
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
}

export interface WalletTransaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  status: 'pending' | 'completed' | 'failed';
  from: string;
  to: string;
  amount: string;
  token: string;
  usdValue: number;
  fee: string;
  hash: string;
  network: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}

export interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  totalVolume24h: string;
  totalTransactions24h: number;
  averageTransactionValue: string;
  topNetworks: Array<{
    network: string;
    wallets: number;
    volume: string;
  }>;
}

export interface WalletFilters {
  status?: 'active' | 'inactive' | 'blocked';
  network?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  minBalance?: number;
  maxBalance?: number;
}
