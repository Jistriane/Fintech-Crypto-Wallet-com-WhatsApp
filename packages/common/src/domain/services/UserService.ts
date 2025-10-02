import { ILogger } from '../interfaces/ILogger';
import { IUserRepository } from '../repositories/IUserRepository';
import { KYCLevel, KYCStatus } from '../../types';

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger
  ) {}

  async createUser(phone: string): Promise<string> {
    try {
      const user = await this.userRepository.save({
        phone,
        kycStatus: KYCStatus.PENDING,
        kycLevel: KYCLevel.LEVEL_0,
        whatsappOptIn: false,
      });

      return user.id;
    } catch (error) {
      this.logger.error('Error creating user', { error });
      throw error;
    }
  }

  async getUser(id: string): Promise<any> {
    try {
      return await this.userRepository.findOne(id);
    } catch (error) {
      this.logger.error('Error getting user', { error });
      throw error;
    }
  }

  async getUserByPhone(phone: string): Promise<any> {
    try {
      return await this.userRepository.findOne({ phone });
    } catch (error) {
      this.logger.error('Error getting user by phone', { error });
      throw error;
    }
  }

  async updateKYCStatus(id: string, status: KYCStatus): Promise<void> {
    try {
      await this.userRepository.update(id, { kycStatus: status });
    } catch (error) {
      this.logger.error('Error updating KYC status', { error });
      throw error;
    }
  }

  async updateKYCLevel(id: string, level: KYCLevel): Promise<void> {
    try {
      await this.userRepository.update(id, { kycLevel: level });
    } catch (error) {
      this.logger.error('Error updating KYC level', { error });
      throw error;
    }
  }

  async setWhatsAppOptIn(id: string, optIn: boolean): Promise<void> {
    try {
      await this.userRepository.update(id, { whatsappOptIn: optIn });
    } catch (error) {
      this.logger.error('Error updating WhatsApp opt-in', { error });
      throw error;
    }
  }

  async getUsersByKYCStatus(status: KYCStatus): Promise<any[]> {
    try {
      return await this.userRepository.find({ kycStatus: status });
    } catch (error) {
      this.logger.error('Error getting users by KYC status', { error });
      throw error;
    }
  }

  async getUsersByKYCLevel(level: KYCLevel): Promise<any[]> {
    try {
      return await this.userRepository.find({ kycLevel: level });
    } catch (error) {
      this.logger.error('Error getting users by KYC level', { error });
      throw error;
    }
  }

  async getWhatsAppOptInUsers(): Promise<any[]> {
    try {
      return await this.userRepository.find({ whatsappOptIn: true });
    } catch (error) {
      this.logger.error('Error getting WhatsApp opt-in users', { error });
      throw error;
    }
  }
}