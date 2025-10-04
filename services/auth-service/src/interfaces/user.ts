export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  lastLogin: string;
  wallets: {
    id: string;
    address: string;
    network: string;
    balance: {
      native: string;
      usd: number;
    };
  }[];
  twoFactorEnabled: boolean;
  whatsappVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  kycVerifiedUsers: number;
  twoFactorEnabledUsers: number;
  whatsappVerifiedUsers: number;
  newUsersLast30Days: number;
}

export interface UserRepository {
  findAll(page: number, limit: number, filters?: any): Promise<{ users: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  getStats(): Promise<UserStats>;
}
