export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  network: string;
  logoUrl: string;
  balance: string;
  balanceUSD: string;
  change24h: string;
  price: string;
  priceUSD: string;
}

export interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP' | 'LIQUIDITY_ADD' | 'LIQUIDITY_REMOVE';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  hash: string;
  fromAddress: string;
  toAddress: string;
  token: Token;
  amount: string;
  amountUSD: string;
  fee: string;
  feeUSD: string;
  network: string;
  timestamp: string;
  confirmations: number;
  requiredConfirmations: number;
}

export interface Wallet {
  id: string;
  address: string;
  network: string;
  isActive: boolean;
  totalBalanceUSD: string;
  change24h: string;
  tokens: Token[];
  transactions: Transaction[];
}

export interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  selectedToken: Token | null;
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

export interface SendTokenData {
  walletId: string;
  tokenId: string;
  toAddress: string;
  amount: string;
}

export interface SwapTokenData {
  walletId: string;
  fromTokenId: string;
  toTokenId: string;
  amount: string;
}

export interface AddLiquidityData {
  walletId: string;
  token0Id: string;
  token1Id: string;
  amount0: string;
  amount1: string;
}

export interface RemoveLiquidityData {
  walletId: string;
  poolId: string;
  amount: string;
}
