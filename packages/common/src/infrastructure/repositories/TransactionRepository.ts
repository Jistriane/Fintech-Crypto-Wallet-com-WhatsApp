import { Repository, EntityRepository } from 'typeorm';
import { TransactionEntity } from '../database/entities/TransactionEntity';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { ILogger } from '../../domain/interfaces/ILogger';
import { Network, TransactionStatus, TransactionType } from '../../types';

@EntityRepository(TransactionEntity)
export class TransactionRepository implements ITransactionRepository {
  constructor(
    private readonly repository: Repository<TransactionEntity>,
    private readonly logger: ILogger
  ) {}

  async save(data: {
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
  }): Promise<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      const transaction = this.repository.create(data);
      return await this.repository.save(transaction);
    } catch (error) {
      this.logger.error('Error saving transaction', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding transaction', { error });
      throw error;
    }
  }

  async find(filter: {
    walletId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    network?: Network;
    createdAt?: {
      $gte?: Date;
      $lte?: Date;
    };
  }): Promise<Array<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      const where: any = {};
      if (filter.walletId) where.walletId = filter.walletId;
      if (filter.type) where.type = filter.type;
      if (filter.status) where.status = filter.status;
      if (filter.network) where.network = filter.network;
      if (filter.createdAt) {
        where.createdAt = {};
        if (filter.createdAt.$gte) where.createdAt.gte = filter.createdAt.$gte;
        if (filter.createdAt.$lte) where.createdAt.lte = filter.createdAt.$lte;
      }
      return await this.repository.find({ where });
    } catch (error) {
      this.logger.error('Error finding transactions', { error });
      throw error;
    }
  }

  async update(id: string, data: {
    status?: TransactionStatus;
    hash?: string;
    error?: string;
  }): Promise<void> {
    try {
      await this.repository.update(id, data);
    } catch (error) {
      this.logger.error('Error updating transaction', { error });
      throw error;
    }
  }
}