export type SupportedChain =
  | 'ethereum'
  | 'polygon'
  | 'bsc'
  | 'arbitrum'
  | 'optimism'
  | 'avalanche';

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorers: {
    default: {
      name: string;
      url: string;
    };
  };
}

export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface WalletBalance {
  chain: SupportedChain;
  address: string;
  balance: string;
  tokens: {
    [symbol: string]: {
      balance: string;
      usdValue: string;
    };
  };
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasLimit: string;
  data: string;
  chainId: number;
}
