import { Network } from '../../types';

export interface IWalletRepository {
  save(data: {
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive?: boolean;
  }): Promise<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  findOne(id: string): Promise<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  findByAddress(address: string): Promise<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  findByUserId(userId: string): Promise<Array<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>>;

  update(id: string, data: {
    isActive?: boolean;
    privateKeyEncrypted?: string;
  }): Promise<void>;

  updateBalance(walletId: string, tokenAddress: string, balance: string): Promise<void>;

  getTokenBalances(walletId: string): Promise<Array<{
    tokenAddress: string;
    balance: string;
  }>>;
}