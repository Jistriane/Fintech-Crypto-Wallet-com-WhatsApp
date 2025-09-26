import { Transaction } from '../entities/Transaction';
import { TransactionStatus, TransactionType } from '../../types';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByHash(hash: string): Promise<Transaction | null>;
  findByWalletId(walletId: string): Promise<Transaction[]>;
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;
  findByType(type: TransactionType): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  updateStatus(transactionId: string, status: TransactionStatus): Promise<Transaction>;
  delete(transactionId: string): Promise<void>;
  findPending(): Promise<Transaction[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
}
