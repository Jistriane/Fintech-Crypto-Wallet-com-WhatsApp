import { ethers } from 'ethers';
import { User } from '../entities/User';
import { IUserRepository } from '../repositories/IUserRepository';
import { KYCLevel, KYCStatus } from '../../types';
import { KYC_LEVELS } from '../../constants/kyc';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(phone: string, email?: string): Promise<User> {
    // Verifica se já existe usuário com este telefone
    const existingUser = await this.userRepository.findByPhone(phone);
    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    const user = new User(
      ethers.utils.id(Date.now().toString()), // ID único
      phone,
      email,
      'PENDING', // KYC status inicial
      'LEVEL_0', // KYC level inicial
      true, // WhatsApp opt-in por padrão
      new Date(),
      new Date()
    );

    return await this.userRepository.create(user);
  }

  async updateKYCStatus(userId: string, status: KYCStatus): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateKYCStatus(status);
    return await this.userRepository.update(user);
  }

  async updateKYCLevel(userId: string, level: KYCLevel): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateKYCLevel(level);
    return await this.userRepository.update(user);
  }

  async canPerformOperation(userId: string, operation: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.canPerformOperation(operation);
  }

  async getTransactionLimits(userId: string): Promise<{
    dailyLimit: string;
    monthlyLimit: string;
    singleTransactionLimit: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const limits = KYC_LEVELS[user.kycLevel];
    return {
      dailyLimit: limits.dailyLimit.toString(),
      monthlyLimit: limits.monthlyLimit.toString(),
      singleTransactionLimit: limits.singleTransactionLimit.toString()
    };
  }

  async getUsersByKYCStatus(status: KYCStatus): Promise<User[]> {
    return await this.userRepository.findByKYCStatus(status);
  }

  async getUsersByKYCLevel(level: KYCLevel): Promise<User[]> {
    return await this.userRepository.findByKYCLevel(level);
  }
}
