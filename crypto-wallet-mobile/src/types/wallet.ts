export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  network: string;
  logoUrl?: string;
  price: number;
  priceChange24h: number;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceUsd: number;
}

export interface Transaction {
  id: string;
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

export interface WalletState {
  address: string;
  network: string;
  balances: TokenBalance[];
  transactions: Transaction[];
  selectedTransaction: TransactionDetails | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendTokenData {
  tokenAddress: string;
  amount: string;
  to: string;
}

export interface SwapTokenData {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  slippage: number;
}

export interface AddLiquidityData {
  token0Address: string;
  token1Address: string;
  amount0: string;
  amount1: string;
}

export interface RemoveLiquidityData {
  token0Address: string;
  token1Address: string;
  liquidity: string;
}

export interface FarmData {
  poolAddress: string;
  amount: string;
}
