import { Repository, DataSource, Between } from 'typeorm';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionEntity } from '../database/entities/TransactionEntity';
import { TransactionStatus, TransactionType } from '../../types';
import { RedisCache } from '../cache/RedisCache';
import { BigNumber } from 'ethers';

export class TransactionRepository implements ITransactionRepository {
  private readonly repository: Repository<TransactionEntity>;
  private readonly cacheKeyPrefix = 'transaction';

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(TransactionEntity);
  }

  private toDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.walletId,
      entity.type,
      entity.status,
      entity.fromAddress,
      entity.toAddress,
      {
        address: entity.tokenAddress,
        symbol: '', // Será preenchido pelo serviço
        decimals: 18, // Será preenchido pelo serviço
        network: entity.wallet.network
      },
      BigNumber.from(entity.amount),
      entity.hash,
      entity.failureReason,
      entity.createdAt,
      entity.confirmedAt,
      entity.updatedAt
    );
  }

  private toEntity(domain: Transaction): Partial<TransactionEntity> {
    return {
      id: domain.id,
      walletId: domain.walletId,
      type: domain.type,
      status: domain.status,
      fromAddress: domain.fromAddress,
      toAddress: domain.toAddress,
      tokenAddress: domain.token.address,
      amount: domain.amount.toString(),
      hash: domain.hash,
      failureReason: domain.failureReason,
      confirmedAt: domain.confirmedAt
    };
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const entity = await this.repository.save(this.toEntity(transaction));
    return this.toDomain(entity as TransactionEntity);
  }

  async findById(id: string): Promise<Transaction | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'id', id);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.repository.findOne({
        where: { id },
        relations: ['wallet']
      });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async findByHash(hash: string): Promise<Transaction | null> {
    const cacheKey = RedisCache.generateKey(this.cacheKeyPrefix, 'hash', hash);
    
    return await RedisCache.getOrSet(cacheKey, async () => {
      const entity = await this.repository.findOne({
        where: { hash },
        relations: ['wallet']
      });
      return entity ? this.toDomain(entity) : null;
    });
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { walletId },
      relations: ['wallet'],
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['wallet'],
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByType(type: TransactionType): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: { type },
      relations: ['wallet'],
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(transaction: Transaction): Promise<Transaction> {
    await this.repository.update(transaction.id, this.toEntity(transaction));
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', transaction.id));
    if (transaction.hash) {
      await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'hash', transaction.hash));
    }
    
    return transaction;
  }

  async updateStatus(transactionId: string, status: TransactionStatus): Promise<Transaction> {
    await this.repository.update(transactionId, { status });
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', transactionId));
    
    const updated = await this.findById(transactionId);
    if (!updated) throw new Error('Transaction not found after update');
    return updated;
  }

  async delete(transactionId: string): Promise<void> {
    const transaction = await this.findById(transactionId);
    if (!transaction) return;

    await this.repository.delete(transactionId);
    
    // Invalidar cache
    await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'id', transactionId));
    if (transaction.hash) {
      await RedisCache.del(RedisCache.generateKey(this.cacheKeyPrefix, 'hash', transaction.hash));
    }
  }

  async findPending(): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: [
        { status: 'PENDING' },
        { status: 'PROCESSING' }
      ],
      relations: ['wallet'],
      order: { createdAt: 'ASC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const entities = await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate)
      },
      relations: ['wallet'],
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomain(entity));
  }
}
