import { Repository, EntityRepository, LessThan } from 'typeorm';
import { Wallet, WalletStatus, WalletNetwork } from '../../domain/entities/Wallet';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ILogger } from '@fintech/common';
import { subDays } from 'date-fns';

@EntityRepository(Wallet)
export class WalletRepository implements IWalletRepository {
  constructor(
    private readonly repository: Repository<Wallet>,
    private readonly logger: ILogger
  ) {}

  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    try {
      const wallet = this.repository.create(walletData);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error creating wallet', { error, walletData });
      throw error;
    }
  }

  async findById(id: string): Promise<Wallet | null> {
    try {
      return await this.repository.findOne({
        where: { id },
        relations: ['tokenBalances', 'transactions']
      });
    } catch (error) {
      this.logger.error('Error finding wallet by id', { error, id });
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    try {
      return await this.repository.find({
        where: { userId },
        relations: ['tokenBalances']
      });
    } catch (error) {
      this.logger.error('Error finding wallets by user id', { error, userId });
      throw error;
    }
  }

  async findByAddress(address: string): Promise<Wallet | null> {
    try {
      return await this.repository.findOne({
        where: { address },
        relations: ['tokenBalances']
      });
    } catch (error) {
      this.logger.error('Error finding wallet by address', { error, address });
      throw error;
    }
  }

  async update(id: string, data: Partial<Wallet>): Promise<Wallet> {
    try {
      await this.repository.update(id, data);
      const updatedWallet = await this.findById(id);
      if (!updatedWallet) {
        throw new Error('Wallet not found after update');
      }
      return updatedWallet;
    } catch (error) {
      this.logger.error('Error updating wallet', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.softDelete(id);
    } catch (error) {
      this.logger.error('Error deleting wallet', { error, id });
      throw error;
    }
  }

  async findByNetwork(network: WalletNetwork): Promise<Wallet[]> {
    try {
      return await this.repository.find({
        where: { network },
        relations: ['tokenBalances']
      });
    } catch (error) {
      this.logger.error('Error finding wallets by network', { error, network });
      throw error;
    }
  }

  async findByStatus(status: WalletStatus): Promise<Wallet[]> {
    try {
      return await this.repository.find({
        where: { status },
        relations: ['tokenBalances']
      });
    } catch (error) {
      this.logger.error('Error finding wallets by status', { error, status });
      throw error;
    }
  }

  async updateStatus(id: string, status: WalletStatus): Promise<Wallet> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      this.logger.error('Error updating wallet status', { error, id, status });
      throw error;
    }
  }

  async addTrustedAddress(id: string, address: string): Promise<Wallet> {
    try {
      const wallet = await this.findById(id);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      wallet.addTrustedAddress(address);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error adding trusted address', { error, id, address });
      throw error;
    }
  }

  async removeTrustedAddress(id: string, address: string): Promise<Wallet> {
    try {
      const wallet = await this.findById(id);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      wallet.removeTrustedAddress(address);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error removing trusted address', { error, id, address });
      throw error;
    }
  }

  async updateSettings(id: string, settings: Partial<Wallet['settings']>): Promise<Wallet> {
    try {
      const wallet = await this.findById(id);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      wallet.updateSettings(settings);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error updating wallet settings', { error, id, settings });
      throw error;
    }
  }

  async updateBackupInfo(id: string, info: Partial<Wallet['backupInfo']>): Promise<Wallet> {
    try {
      const wallet = await this.findById(id);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      wallet.updateBackupInfo(info);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error updating backup info', { error, id, info });
      throw error;
    }
  }

  async addSecurityEvent(id: string, event: string, ip: string, deviceInfo: any): Promise<Wallet> {
    try {
      const wallet = await this.findById(id);
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      wallet.addSecurityEvent(event, ip, deviceInfo);
      return await this.repository.save(wallet);
    } catch (error) {
      this.logger.error('Error adding security event', { error, id, event });
      throw error;
    }
  }

  async findActiveWallets(): Promise<Wallet[]> {
    try {
      return await this.repository.find({
        where: {
          status: WalletStatus.ACTIVE,
          deletedAt: null
        },
        relations: ['tokenBalances']
      });
    } catch (error) {
      this.logger.error('Error finding active wallets', { error });
      throw error;
    }
  }

  async findInactiveWallets(daysInactive: number): Promise<Wallet[]> {
    try {
      const cutoffDate = subDays(new Date(), daysInactive);
      return await this.repository
        .createQueryBuilder('wallet')
        .leftJoinAndSelect('wallet.transactions', 'transaction')
        .where('wallet.status = :status', { status: WalletStatus.ACTIVE })
        .andWhere('transaction.createdAt < :cutoffDate', { cutoffDate })
        .getMany();
    } catch (error) {
      this.logger.error('Error finding inactive wallets', { error, daysInactive });
      throw error;
    }
  }

  async countByNetwork(network: WalletNetwork): Promise<number> {
    try {
      return await this.repository.count({
        where: { network }
      });
    } catch (error) {
      this.logger.error('Error counting wallets by network', { error, network });
      throw error;
    }
  }

  async countByStatus(status: WalletStatus): Promise<number> {
    try {
      return await this.repository.count({
        where: { status }
      });
    } catch (error) {
      this.logger.error('Error counting wallets by status', { error, status });
      throw error;
    }
  }
}
