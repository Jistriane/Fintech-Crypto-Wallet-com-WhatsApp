import { BigNumberish, formatUnits } from 'ethers';
import { ILogger } from '../interfaces/ILogger';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IWalletRepository } from '../repositories/IWalletRepository';
import { Network, TransactionStatus, TransactionType } from '../../types';

export class TransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly logger: ILogger
  ) {}

  async createTransaction(
    walletId: string,
    type: TransactionType,
    fromAddress: string,
    toAddress: string,
    tokenAddress: string,
    amount: BigNumberish,
    network: Network
  ): Promise<string> {
    try {
      const transaction = await this.transactionRepository.save({
        walletId,
        type,
        status: TransactionStatus.PENDING,
        fromAddress,
        toAddress,
        tokenAddress,
        amount: formatUnits(amount, 18),
        network,
      });

      return transaction.id;
    } catch (error) {
      this.logger.error('Error creating transaction', { error });
      throw error;
    }
  }

  async getTransaction(id: string): Promise<any> {
    try {
      return await this.transactionRepository.findOne(id);
    } catch (error) {
      this.logger.error('Error getting transaction', { error });
      throw error;
    }
  }

  async getTransactionsByWallet(walletId: string): Promise<any[]> {
    try {
      return await this.transactionRepository.find({ walletId });
    } catch (error) {
      this.logger.error('Error getting transactions by wallet', { error });
      throw error;
    }
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    hash?: string,
    error?: string
  ): Promise<void> {
    try {
      await this.transactionRepository.update(id, {
        status,
        hash,
        error,
      });
    } catch (error) {
      this.logger.error('Error updating transaction status', { error });
      throw error;
    }
  }

  async getTransactionHistory(
    walletId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      return await this.transactionRepository.find({
        walletId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });
    } catch (error) {
      this.logger.error('Error getting transaction history', { error });
      throw error;
    }
  }

  async getPendingTransactions(): Promise<any[]> {
    try {
      return await this.transactionRepository.find({
        status: TransactionStatus.PENDING,
      });
    } catch (error) {
      this.logger.error('Error getting pending transactions', { error });
      throw error;
    }
  }

  async getProcessingTransactions(): Promise<any[]> {
    try {
      return await this.transactionRepository.find({
        status: TransactionStatus.PROCESSING,
      });
    } catch (error) {
      this.logger.error('Error getting processing transactions', { error });
      throw error;
    }
  }
}