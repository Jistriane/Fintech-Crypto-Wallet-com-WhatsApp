export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  network: string;
  price: {
    usd: number;
    brl: number;
    change24h: number;
  };
  volume24h: number;
  marketCap: number;
  status: 'active' | 'inactive' | 'blocked';
}

export interface TokenStats {
  totalTokens: number;
  activeTokens: number;
  totalVolume24h: number;
  totalMarketCap: number;
}

export interface TokenRepository {
  findAll(page: number, limit: number, filters?: any): Promise<{ tokens: Token[]; total: number }>;
  findById(id: string): Promise<Token | null>;
  findByAddress(address: string): Promise<Token | null>;
  create(token: Partial<Token>): Promise<Token>;
  update(id: string, data: Partial<Token>): Promise<Token>;
  delete(id: string): Promise<void>;
  getStats(): Promise<TokenStats>;
  refreshPrice(id: string): Promise<Token>;
  block(id: string): Promise<Token>;
  unblock(id: string): Promise<Token>;
}
