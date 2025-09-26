import { User } from '../entities/User';
import { KYCLevel, KYCStatus } from '../../types';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  update(user: User): Promise<User>;
  updateKYCStatus(userId: string, status: KYCStatus): Promise<User>;
  updateKYCLevel(userId: string, level: KYCLevel): Promise<User>;
  delete(userId: string): Promise<void>;
  findByKYCStatus(status: KYCStatus): Promise<User[]>;
  findByKYCLevel(level: KYCLevel): Promise<User[]>;
}
