export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
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
  blockNumber?: number;
  confirmations?: number;
  metadata?: Record<string, any>;
}

export interface TransactionFilters {
  search?: string;
  type?: Transaction['type'];
  status?: Transaction['status'];
  network?: string;
  startDate?: string;
  endDate?: string;
  walletId?: string;
  userId?: string;
}

export interface TransactionSort {
  field: keyof Transaction;
  direction: 'asc' | 'desc';
}

export interface TransactionPagination {
  page: number;
  limit: number;
  total: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
}

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  typeDistribution: {
    type: Transaction['type'];
    count: number;
    volume: number;
  }[];
  networkDistribution: {
    network: string;
    count: number;
    volume: number;
  }[];
  volumeHistory: {
    date: string;
    volume: number;
  }[];
  countHistory: {
    date: string;
    count: number;
  }[];
}

export interface TransactionEvent {
  id: string;
  transactionId: string;
  type: 'CREATED' | 'STATUS_UPDATED' | 'CONFIRMED' | 'FAILED';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface TransactionDetails {
  transaction: Transaction;
  events: TransactionEvent[];
  receipt?: {
    blockHash: string;
    blockNumber: number;
    contractAddress: string | null;
    cumulativeGasUsed: string;
    effectiveGasPrice: string;
    gasUsed: string;
    logs: any[];
    logsBloom: string;
    status: boolean;
    transactionHash: string;
    transactionIndex: number;
  };
}
