export interface Wallet {
  id: string;
  address: string;
  network: string;
  balance: {
    native: string;
    usd: number;
  };
  status: 'active' | 'inactive' | 'blocked';
  lastActivity: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  totalVolume24h: string;
  totalTransactions24h: number;
}

export interface WalletRepository {
  findAll(page: number, limit: number, filters?: any): Promise<{ wallets: Wallet[]; total: number }>;
  findById(id: string): Promise<Wallet | null>;
  findByAddress(address: string): Promise<Wallet | null>;
  create(wallet: Partial<Wallet>): Promise<Wallet>;
  update(id: string, data: Partial<Wallet>): Promise<Wallet>;
  delete(id: string): Promise<void>;
  getStats(): Promise<WalletStats>;
  refreshBalance(id: string): Promise<Wallet>;
  block(id: string): Promise<Wallet>;
  unblock(id: string): Promise<Wallet>;
}
