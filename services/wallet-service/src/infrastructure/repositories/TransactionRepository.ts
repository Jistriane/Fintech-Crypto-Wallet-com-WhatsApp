import { Repository, EntityRepository, Between, MoreThan } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from '../../domain/entities/Transaction';
import { WalletNetwork } from '../../domain/entities/Wallet';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { ILogger } from '@fintech/common';
import { subDays, startOfDay, endOfDay } from 'date-fns';

@EntityRepository(Transaction)
export class TransactionRepository implements ITransactionRepository {
  constructor(
    private readonly repository: Repository<Transaction>,
    private readonly logger: ILogger
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const transaction = this.repository.create(transactionData);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error creating transaction', { error, transactionData });
      throw error;
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding transaction by id', { error, id });
      throw error;
    }
  }

  async findByHash(hash: string): Promise<Transaction | null> {
    try {
      return await this.repository.findOne({
        where: { hash },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding transaction by hash', { error, hash });
      throw error;
    }
  }

  async findByWalletId(walletId: string, limit?: number, offset?: number): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { wallet: { id: walletId } },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      this.logger.error('Error finding transactions by wallet id', { error, walletId });
      throw error;
    }
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    try {
      await this.repository.update(id, data);
      const updatedTransaction = await this.findById(id);
      if (!updatedTransaction) {
        throw new Error('Transaction not found after update');
      }
      return updatedTransaction;
    } catch (error) {
      this.logger.error('Error updating transaction', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting transaction', { error, id });
      throw error;
    }
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { status },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding transactions by status', { error, status });
      throw error;
    }
  }

  async findByType(type: TransactionType): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { type },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding transactions by type', { error, type });
      throw error;
    }
  }

  async findByNetwork(network: WalletNetwork): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { network },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding transactions by network', { error, network });
      throw error;
    }
  }

  async updateStatus(id: string, status: TransactionStatus, error?: string): Promise<Transaction> {
    try {
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      transaction.updateStatus(status, error);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error updating transaction status', { error, id, status });
      throw error;
    }
  }

  async addConfirmation(id: string, confirmations: number): Promise<Transaction> {
    try {
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      transaction.addConfirmation(confirmations);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error adding confirmation', { error, id, confirmations });
      throw error;
    }
  }

  async addWhatsAppNotification(id: string, type: string): Promise<Transaction> {
    try {
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      transaction.addWhatsAppNotification(type);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error adding WhatsApp notification', { error, id, type });
      throw error;
    }
  }

  async addWhatsAppConfirmation(id: string, type: string, confirmed: boolean): Promise<Transaction> {
    try {
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      transaction.addWhatsAppConfirmation(type, confirmed);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error adding WhatsApp confirmation', { error, id, type, confirmed });
      throw error;
    }
  }

  async findPendingTransactions(): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { status: TransactionStatus.PENDING },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding pending transactions', { error });
      throw error;
    }
  }

  async findFailedTransactions(): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: { status: TransactionStatus.FAILED },
        relations: ['wallet']
      });
    } catch (error) {
      this.logger.error('Error finding failed transactions', { error });
      throw error;
    }
  }

  async findTransactionsByDateRange(
    walletId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: {
          wallet: { id: walletId },
          createdAt: Between(startOfDay(startDate), endOfDay(endDate))
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding transactions by date range', { error, walletId, startDate, endDate });
      throw error;
    }
  }

  async findTransactionsByToken(walletId: string, tokenAddress: string): Promise<Transaction[]> {
    try {
      return await this.repository.find({
        where: {
          wallet: { id: walletId },
          tokenAddress
        },
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      this.logger.error('Error finding transactions by token', { error, walletId, tokenAddress });
      throw error;
    }
  }

  async getTransactionVolume(
    walletId: string,
    days: number
  ): Promise<{ date: Date; volume: string }[]> {
    try {
      const startDate = subDays(new Date(), days);
      const transactions = await this.repository
        .createQueryBuilder('transaction')
        .select('DATE(transaction.createdAt)', 'date')
        .addSelect('SUM(CAST(transaction.amountUSD AS DECIMAL))', 'volume')
        .where('transaction.wallet.id = :walletId', { walletId })
        .andWhere('transaction.createdAt >= :startDate', { startDate })
        .groupBy('DATE(transaction.createdAt)')
        .orderBy('DATE(transaction.createdAt)', 'ASC')
        .getRawMany();

      return transactions.map(t => ({
        date: new Date(t.date),
        volume: t.volume
      }));
    } catch (error) {
      this.logger.error('Error getting transaction volume', { error, walletId, days });
      throw error;
    }
  }

  async getTransactionCount(
    walletId: string,
    days: number
  ): Promise<{ date: Date; count: number }[]> {
    try {
      const startDate = subDays(new Date(), days);
      const counts = await this.repository
        .createQueryBuilder('transaction')
        .select('DATE(transaction.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('transaction.wallet.id = :walletId', { walletId })
        .andWhere('transaction.createdAt >= :startDate', { startDate })
        .groupBy('DATE(transaction.createdAt)')
        .orderBy('DATE(transaction.createdAt)', 'ASC')
        .getRawMany();

      return counts.map(c => ({
        date: new Date(c.date),
        count: parseInt(c.count)
      }));
    } catch (error) {
      this.logger.error('Error getting transaction count', { error, walletId, days });
      throw error;
    }
  }

  async getAverageGasFees(
    network: WalletNetwork,
    days: number
  ): Promise<{ date: Date; averageFee: string }[]> {
    try {
      const startDate = subDays(new Date(), days);
      const fees = await this.repository
        .createQueryBuilder('transaction')
        .select('DATE(transaction.createdAt)', 'date')
        .addSelect('AVG(CAST(transaction.gasFeeUSD AS DECIMAL))', 'averageFee')
        .where('transaction.network = :network', { network })
        .andWhere('transaction.createdAt >= :startDate', { startDate })
        .groupBy('DATE(transaction.createdAt)')
        .orderBy('DATE(transaction.createdAt)', 'ASC')
        .getRawMany();

      return fees.map(f => ({
        date: new Date(f.date),
        averageFee: f.averageFee
      }));
    } catch (error) {
      this.logger.error('Error getting average gas fees', { error, network, days });
      throw error;
    }
  }

  async getTopRecipients(
    walletId: string,
    limit: number
  ): Promise<{ address: string; count: number; totalAmount: string }[]> {
    try {
      return await this.repository
        .createQueryBuilder('transaction')
        .select('transaction.to', 'address')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(CAST(transaction.amountUSD AS DECIMAL))', 'totalAmount')
        .where('transaction.wallet.id = :walletId', { walletId })
        .andWhere('transaction.type = :type', { type: TransactionType.SEND })
        .groupBy('transaction.to')
        .orderBy('count', 'DESC')
        .addOrderBy('totalAmount', 'DESC')
        .limit(limit)
        .getRawMany();
    } catch (error) {
      this.logger.error('Error getting top recipients', { error, walletId, limit });
      throw error;
    }
  }

  async countByStatus(status: TransactionStatus): Promise<number> {
    try {
      return await this.repository.count({
        where: { status }
      });
    } catch (error) {
      this.logger.error('Error counting transactions by status', { error, status });
      throw error;
    }
  }

  async countByType(type: TransactionType): Promise<number> {
    try {
      return await this.repository.count({
        where: { type }
      });
    } catch (error) {
      this.logger.error('Error counting transactions by type', { error, type });
      throw error;
    }
  }

  async countByNetwork(network: WalletNetwork): Promise<number> {
    try {
      return await this.repository.count({
        where: { network }
      });
    } catch (error) {
      this.logger.error('Error counting transactions by network', { error, network });
      throw error;
    }
  }

  async getTotalVolumeByNetwork(network: WalletNetwork): Promise<string> {
    try {
      const result = await this.repository
        .createQueryBuilder('transaction')
        .select('SUM(CAST(transaction.amountUSD AS DECIMAL))', 'total')
        .where('transaction.network = :network', { network })
        .andWhere('transaction.status = :status', { status: TransactionStatus.CONFIRMED })
        .getRawOne();
      return result?.total || '0';
    } catch (error) {
      this.logger.error('Error getting total volume by network', { error, network });
      throw error;
    }
  }

  async getAverageTransactionTime(walletId: string): Promise<number> {
    try {
      const transactions = await this.repository.find({
        where: {
          wallet: { id: walletId },
          status: TransactionStatus.CONFIRMED,
          confirmedAt: MoreThan(subDays(new Date(), 30))
        }
      });

      if (transactions.length === 0) return 0;

      const totalTime = transactions.reduce((sum, tx) => sum + tx.duration, 0);
      return totalTime / transactions.length;
    } catch (error) {
      this.logger.error('Error getting average transaction time', { error, walletId });
      throw error;
    }
  }

  async getSuccessRate(walletId: string): Promise<number> {
    try {
      const [total, successful] = await Promise.all([
        this.repository.count({
          where: {
            wallet: { id: walletId },
            createdAt: MoreThan(subDays(new Date(), 30))
          }
        }),
        this.repository.count({
          where: {
            wallet: { id: walletId },
            status: TransactionStatus.CONFIRMED,
            createdAt: MoreThan(subDays(new Date(), 30))
          }
        })
      ]);

      return total === 0 ? 0 : (successful / total) * 100;
    } catch (error) {
      this.logger.error('Error getting success rate', { error, walletId });
      throw error;
    }
  }
}
