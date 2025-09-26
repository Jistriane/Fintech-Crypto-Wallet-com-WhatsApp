import { BigNumber } from 'ethers';

export type KYCLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

export type KYCStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';

export type TransactionType = 
  | 'SWAP'
  | 'TRANSFER'
  | 'LIQUIDITY_ADD'
  | 'LIQUIDITY_REMOVE'
  | 'FIAT_DEPOSIT'
  | 'FIAT_WITHDRAWAL';

export type TransactionStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

export type Network = 'POLYGON' | 'BSC';

export type WhatsAppPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  network: Network;
}

export interface TokenBalance {
  token: Token;
  balance: BigNumber;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  kycStatus: KYCStatus;
  kycLevel: KYCLevel;
  whatsappOptIn: boolean;
}

export interface SmartWallet {
  id: string;
  userId: string;
  address: string;
  privateKeyEncrypted: string;
  network: Network;
  isActive: boolean;
  balances: TokenBalance[];
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  fromAddress: string;
  toAddress: string;
  token: Token;
  amount: BigNumber;
  hash?: string;
  failureReason?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface WhatsAppNotification {
  id: string;
  userId: string;
  type: string;
  priority: WhatsAppPriority;
  content: string;
  sentAt?: Date;
  deliveredAt?: Date;
  retryCount: number;
}
