import { ethers, BigNumber } from 'ethers';
import { Transaction } from '../entities/Transaction';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { WalletService } from './WalletService';
import { TransactionType, Token } from '../../types';

export class TransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletService: WalletService
  ) {}

  async createTransaction(
    walletId: string,
    type: TransactionType,
    fromAddress: string,
    toAddress: string,
    token: Token,
    amount: BigNumber
  ): Promise<Transaction> {
    const transaction = new Transaction(
      ethers.utils.id(Date.now().toString()), // ID único
      walletId,
      type,
      'PENDING',
      fromAddress,
      toAddress,
      token,
      amount,
      undefined, // hash
      undefined, // failureReason
      new Date(),
      undefined, // confirmedAt
      new Date()
    );

    return await this.transactionRepository.create(transaction);
  }

  async confirmTransaction(transactionId: string, hash: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.confirm(hash);
    return await this.transactionRepository.update(transaction);
  }

  async failTransaction(transactionId: string, reason: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.fail(reason);
    return await this.transactionRepository.update(transaction);
  }

  async getTransactionsByWallet(walletId: string): Promise<Transaction[]> {
    return await this.transactionRepository.findByWalletId(walletId);
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await this.transactionRepository.findPending();
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await this.transactionRepository.findByDateRange(startDate, endDate);
  }
}
