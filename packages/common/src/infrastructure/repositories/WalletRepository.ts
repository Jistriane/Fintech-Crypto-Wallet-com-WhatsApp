import { Repository, EntityRepository } from 'typeorm';
import { WalletEntity } from '../database/entities/WalletEntity';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ILogger } from '../../domain/interfaces/ILogger';
import { Network } from '../../types';

@EntityRepository(WalletEntity)
export class WalletRepository implements IWalletRepository {
  constructor(
    private readonly repository: Repository<WalletEntity>,
    private readonly logger: ILogger
  ) {}

  async save(data: {
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
  }> {
    try {
      const wallet = this.repository.create({
        ...data,
        isActive: data.isActive ?? true
      });
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error saving wallet', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding wallet', { error });
      throw error;
    }
  }

  async findByAddress(address: string): Promise<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      return await this.repository.findOne({ where: { address } });
    } catch (error) {
      this.logger.error('Error finding wallet by address', { error });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Array<{
    id: string;
    userId: string;
    address: string;
    privateKeyEncrypted: string;
    network: Network;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      return await this.repository.find({ where: { userId } });
    } catch (error) {
      this.logger.error('Error finding wallets by user ID', { error });
      throw error;
    }
  }

  async update(id: string, data: {
    isActive?: boolean;
    privateKeyEncrypted?: string;
  }): Promise<void> {
    try {
      await this.repository.update(id, data);
    } catch (error) {
      this.logger.error('Error updating wallet', { error });
      throw error;
    }
  }

  async updateBalance(walletId: string, tokenAddress: string, balance: string): Promise<void> {
    try {
      await this.repository.manager.transaction(async (transactionalEntityManager) => {
        const tokenBalance = await transactionalEntityManager.findOne('token_balances', {
          where: { walletId, tokenAddress }
        });

        if (tokenBalance) {
          await transactionalEntityManager.update('token_balances', 
            { walletId, tokenAddress },
            { balance }
          );
        } else {
          await transactionalEntityManager.insert('token_balances', {
            walletId,
            tokenAddress,
            balance
          });
        }
      });
    } catch (error) {
      this.logger.error('Error updating wallet balance', { error });
      throw error;
    }
  }

  async getTokenBalances(walletId: string): Promise<Array<{
    tokenAddress: string;
    balance: string;
  }>> {
    try {
      return await this.repository.manager.find('token_balances', {
        where: { walletId }
      });
    } catch (error) {
      this.logger.error('Error getting token balances', { error });
      throw error;
    }
  }
}