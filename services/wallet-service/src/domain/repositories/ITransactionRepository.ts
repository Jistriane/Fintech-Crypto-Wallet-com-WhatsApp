import { Transaction, TransactionStatus, TransactionType } from '../entities/Transaction';
import { WalletNetwork } from '../entities/Wallet';

export interface ITransactionRepository {
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByHash(hash: string): Promise<Transaction | null>;
  findByWalletId(walletId: string, limit?: number, offset?: number): Promise<Transaction[]>;
  update(id: string, data: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;
  findByType(type: TransactionType): Promise<Transaction[]>;
  findByNetwork(network: WalletNetwork): Promise<Transaction[]>;
  updateStatus(id: string, status: TransactionStatus, error?: string): Promise<Transaction>;
  addConfirmation(id: string, confirmations: number): Promise<Transaction>;
  addWhatsAppNotification(id: string, type: string): Promise<Transaction>;
  addWhatsAppConfirmation(id: string, type: string, confirmed: boolean): Promise<Transaction>;
  findPendingTransactions(): Promise<Transaction[]>;
  findFailedTransactions(): Promise<Transaction[]>;
  findTransactionsByDateRange(
    walletId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;
  findTransactionsByToken(
    walletId: string,
    tokenAddress: string
  ): Promise<Transaction[]>;
  getTransactionVolume(
    walletId: string,
    days: number
  ): Promise<{
    date: Date;
    volume: string;
  }[]>;
  getTransactionCount(
    walletId: string,
    days: number
  ): Promise<{
    date: Date;
    count: number;
  }[]>;
  getAverageGasFees(
    network: WalletNetwork,
    days: number
  ): Promise<{
    date: Date;
    averageFee: string;
  }[]>;
  getTopRecipients(
    walletId: string,
    limit: number
  ): Promise<{
    address: string;
    count: number;
    totalAmount: string;
  }[]>;
  countByStatus(status: TransactionStatus): Promise<number>;
  countByType(type: TransactionType): Promise<number>;
  countByNetwork(network: WalletNetwork): Promise<number>;
  getTotalVolumeByNetwork(network: WalletNetwork): Promise<string>;
  getAverageTransactionTime(walletId: string): Promise<number>;
  getSuccessRate(walletId: string): Promise<number>;
}
