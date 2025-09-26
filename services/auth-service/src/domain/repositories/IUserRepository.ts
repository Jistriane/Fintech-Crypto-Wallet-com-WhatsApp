import { User, UserStatus, KYCLevel } from '../entities/User';

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findByDeviceId(deviceId: string): Promise<User | null>;
  findByKYCLevel(level: KYCLevel): Promise<User[]>;
  findByStatus(status: UserStatus): Promise<User[]>;
  updateLastLogin(id: string, ip: string, deviceInfo?: any): Promise<User>;
  updateKYCLevel(id: string, level: KYCLevel, reason?: string): Promise<User>;
  addTrustedDevice(id: string, deviceInfo: { deviceId: string; deviceType: string }): Promise<User>;
  removeTrustedDevice(id: string, deviceId: string): Promise<User>;
  updatePreferences(id: string, preferences: Partial<User['preferences']>): Promise<User>;
  findActiveUsers(): Promise<User[]>;
  findInactiveUsers(daysInactive: number): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
  countByKYCLevel(level: KYCLevel): Promise<number>;
  countByStatus(status: UserStatus): Promise<number>;
}
