export interface Wallet {
  id: string;
  userId: string;
  address: string;
  network: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
}

export interface TokenBalance {
  id: string;
  walletId: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  balance: string;
  usdValue: string;
  network: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  hash: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP' | 'ADD_LIQUIDITY' | 'REMOVE_LIQUIDITY' | 'FARM';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  from: string;
  to: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  fee: string;
  timestamp: string;
}

export interface WalletFilters {
  search?: string;
  network?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface WalletSort {
  field: keyof Wallet;
  direction: 'asc' | 'desc';
}

export interface WalletPagination {
  page: number;
  limit: number;
  total: number;
}

export interface WalletsResponse {
  wallets: Wallet[];
  pagination: WalletPagination;
}

export interface WalletStats {
  totalWallets: number;
  activeWallets: number;
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

export interface WalletActivity {
  id: string;
  walletId: string;
  type: 'TRANSACTION' | 'BALANCE_UPDATE' | 'STATUS_UPDATE';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateWalletData {
  userId: string;
  network: string;
}

export interface UpdateWalletData {
  isActive?: boolean;
}
