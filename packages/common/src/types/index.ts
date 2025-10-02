import { BigNumberish } from 'ethers';
import { Network, KYCLevel, KYCStatus, TransactionType, TransactionStatus } from './enums';

export * from './enums';

export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  network: Network;
  balance: BigNumberish;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  amount: BigNumberish;
  network: Network;
  hash?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  phone: string;
  kycStatus: KYCStatus;
  kycLevel: KYCLevel;
  whatsappOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  address: string;
  privateKeyEncrypted: string;
  network: Network;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  deviceId: string;
  ip: string;
  kycLevel: KYCLevel;
  phone: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface TokenPayload {
  userId: string;
  kycLevel: KYCLevel;
  phone: string;
  sessionId: string;
}