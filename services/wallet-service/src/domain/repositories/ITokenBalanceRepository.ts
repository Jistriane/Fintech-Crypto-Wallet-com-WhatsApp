import { TokenBalance } from '../entities/TokenBalance';

export interface ITokenBalanceRepository {
  create(tokenBalance: Partial<TokenBalance>): Promise<TokenBalance>;
  findById(id: string): Promise<TokenBalance | null>;
  findByWalletId(walletId: string): Promise<TokenBalance[]>;
  findByTokenAddress(walletId: string, tokenAddress: string): Promise<TokenBalance | null>;
  update(id: string, data: Partial<TokenBalance>): Promise<TokenBalance>;
  delete(id: string): Promise<void>;
  updateBalance(id: string, balance: string, priceUSD: string): Promise<TokenBalance>;
  updateStats(id: string, stats: Partial<TokenBalance['stats']>): Promise<TokenBalance>;
  addPriceAlert(id: string, condition: 'above' | 'below', price: string): Promise<TokenBalance>;
  removePriceAlert(id: string, alertId: string): Promise<TokenBalance>;
  togglePriceAlert(id: string, alertId: string): Promise<TokenBalance>;
  findTokensWithPriceAlerts(): Promise<TokenBalance[]>;
  findTokensBySymbol(symbol: string): Promise<TokenBalance[]>;
  findTokensByValue(minValueUSD: string): Promise<TokenBalance[]>;
  getPortfolioValue(walletId: string): Promise<string>;
  getPortfolioDistribution(walletId: string): Promise<{
    tokenAddress: string;
    symbol: string;
    percentage: number;
  }[]>;
  getTopTokensByValue(limit: number): Promise<TokenBalance[]>;
  getTokenPerformance(id: string, days: number): Promise<{
    timestamp: Date;
    price: string;
  }[]>;
}
