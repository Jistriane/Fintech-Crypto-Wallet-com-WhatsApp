import { Repository, EntityRepository, LessThan } from 'typeorm';
import { User, UserStatus, KYCLevel } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { subDays } from 'date-fns';
import { ILogger } from '@fintech/common';

@EntityRepository(User)
export class UserRepository implements IUserRepository {
  constructor(
    private readonly repository: Repository<User>,
    private readonly logger: ILogger
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    try {
      const user = this.repository.create(userData);
      return await this.repository.save(user);
    } catch (error) {
      this.logger.error('Error creating user', { error, userData });
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Error finding user by id', { error, id });
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { phone } });
    } catch (error) {
      this.logger.error('Error finding user by phone', { error, phone });
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOne({ where: { email } });
    } catch (error) {
      this.logger.error('Error finding user by email', { error, email });
      throw error;
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      await this.repository.update(id, data);
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }
      return updatedUser;
    } catch (error) {
      this.logger.error('Error updating user', { error, id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.softDelete(id);
    } catch (error) {
      this.logger.error('Error deleting user', { error, id });
      throw error;
    }
  }

  async findByDeviceId(deviceId: string): Promise<User | null> {
    try {
      return await this.repository
        .createQueryBuilder('user')
        .where('user.deviceInfo->\'deviceId\' = :deviceId', { deviceId })
        .orWhere('user.trustedDevices @> :devices', {
          devices: JSON.stringify([{ deviceId, isActive: true }])
        })
        .getOne();
    } catch (error) {
      this.logger.error('Error finding user by device id', { error, deviceId });
      throw error;
    }
  }

  async findByKYCLevel(level: KYCLevel): Promise<User[]> {
    try {
      return await this.repository.find({ where: { kycLevel: level } });
    } catch (error) {
      this.logger.error('Error finding users by KYC level', { error, level });
      throw error;
    }
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    try {
      return await this.repository.find({ where: { status } });
    } catch (error) {
      this.logger.error('Error finding users by status', { error, status });
      throw error;
    }
  }

  async updateLastLogin(id: string, ip: string, deviceInfo?: any): Promise<User> {
    try {
      const updateData: Partial<User> = {
        lastLoginAt: new Date(),
        lastLoginIp: ip
      };
      if (deviceInfo) {
        updateData.deviceInfo = deviceInfo;
      }
      return await this.update(id, updateData);
    } catch (error) {
      this.logger.error('Error updating last login', { error, id, ip });
      throw error;
    }
  }

  async updateKYCLevel(id: string, level: KYCLevel, reason?: string): Promise<User> {
    try {
      const updateData: Partial<User> = {
        kycLevel: level,
        kycRejectionReason: reason
      };
      return await this.update(id, updateData);
    } catch (error) {
      this.logger.error('Error updating KYC level', { error, id, level });
      throw error;
    }
  }

  async addTrustedDevice(id: string, deviceInfo: { deviceId: string; deviceType: string }): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      user.addTrustedDevice(deviceInfo);
      return await this.repository.save(user);
    } catch (error) {
      this.logger.error('Error adding trusted device', { error, id, deviceInfo });
      throw error;
    }
  }

  async removeTrustedDevice(id: string, deviceId: string): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      user.removeTrustedDevice(deviceId);
      return await this.repository.save(user);
    } catch (error) {
      this.logger.error('Error removing trusted device', { error, id, deviceId });
      throw error;
    }
  }

  async updatePreferences(id: string, preferences: Partial<User['preferences']>): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      user.updatePreferences(preferences);
      return await this.repository.save(user);
    } catch (error) {
      this.logger.error('Error updating preferences', { error, id, preferences });
      throw error;
    }
  }

  async findActiveUsers(): Promise<User[]> {
    try {
      return await this.repository.find({
        where: {
          status: UserStatus.ACTIVE,
          deletedAt: null
        }
      });
    } catch (error) {
      this.logger.error('Error finding active users', { error });
      throw error;
    }
  }

  async findInactiveUsers(daysInactive: number): Promise<User[]> {
    try {
      const cutoffDate = subDays(new Date(), daysInactive);
      return await this.repository.find({
        where: {
          lastLoginAt: LessThan(cutoffDate),
          status: UserStatus.ACTIVE
        }
      });
    } catch (error) {
      this.logger.error('Error finding inactive users', { error, daysInactive });
      throw error;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      return await this.repository
        .createQueryBuilder('user')
        .where('user.email ILIKE :query', { query: `%${query}%` })
        .orWhere('user.phone ILIKE :query', { query: `%${query}%` })
        .getMany();
    } catch (error) {
      this.logger.error('Error searching users', { error, query });
      throw error;
    }
  }

  async countByKYCLevel(level: KYCLevel): Promise<number> {
    try {
      return await this.repository.count({
        where: { kycLevel: level }
      });
    } catch (error) {
      this.logger.error('Error counting users by KYC level', { error, level });
      throw error;
    }
  }

  async countByStatus(status: UserStatus): Promise<number> {
    try {
      return await this.repository.count({
        where: { status }
      });
    } catch (error) {
      this.logger.error('Error counting users by status', { error, status });
      throw error;
    }
  }
}
