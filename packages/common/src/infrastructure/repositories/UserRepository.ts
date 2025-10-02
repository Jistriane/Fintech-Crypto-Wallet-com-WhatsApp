import { Repository, EntityRepository } from 'typeorm';
import { UserEntity } from '../database/entities/UserEntity';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ILogger } from '../../domain/interfaces/ILogger';
import { KYCLevel, KYCStatus } from '../../types';

@EntityRepository(UserEntity)
export class UserRepository implements IUserRepository {
  constructor(
    private readonly repository: Repository<UserEntity>,
    private readonly logger: ILogger
  ) {}

  async save(data: {
    phone: string;
    password?: string;
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> {
    try {
      const user = this.repository.create({
        ...data,
        kycStatus: data.kycStatus ?? KYCStatus.PENDING,
        kycLevel: data.kycLevel ?? KYCLevel.LEVEL_0,
        whatsappOptIn: data.whatsappOptIn ?? false
      });
      return await this.repository.save(user);
    } catch (error) {
      this.logger.error('Error saving user', { error });
      throw error;
    }
  }

  async findOne(id: string): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding user', { error });
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      return await this.repository.findOne({ where: { phone } });
    } catch (error) {
      this.logger.error('Error finding user by phone', { error });
      throw error;
    }
  }

  async find(filter: {
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<Array<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      const where: any = {};
      if (filter.kycStatus) where.kycStatus = filter.kycStatus;
      if (filter.kycLevel) where.kycLevel = filter.kycLevel;
      if (filter.whatsappOptIn !== undefined) where.whatsappOptIn = filter.whatsappOptIn;
      return await this.repository.find({ where });
    } catch (error) {
      this.logger.error('Error finding users', { error });
      throw error;
    }
  }

  async update(id: string, data: {
    password?: string;
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<void> {
    try {
      await this.repository.update(id, data);
    } catch (error) {
      this.logger.error('Error updating user', { error });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting user', { error });
      throw error;
    }
  }
}