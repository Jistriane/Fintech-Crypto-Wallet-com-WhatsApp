import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsPhoneNumber, Length } from 'class-validator';

export enum KYCLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3'
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsPhoneNumber()
  phone: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @Length(8, 100)
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'enum', enum: KYCLevel, default: KYCLevel.LEVEL_0 })
  kycLevel: KYCLevel;

  @Column({ nullable: true })
  kycRejectionReason?: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceId: string;
    deviceType: string;
    osVersion: string;
    appVersion: string;
  };

  @Column({ type: 'jsonb', default: [] })
  trustedDevices: {
    deviceId: string;
    deviceType: string;
    lastUsedAt: Date;
    isActive: boolean;
  }[];

  @Column({ type: 'simple-array', default: [] })
  roles: string[];

  @Column({ type: 'jsonb', default: {} })
  preferences: {
    language: string;
    notifications: {
      whatsapp: boolean;
      email: boolean;
      push: boolean;
    };
    theme: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  // Métodos de domínio
  canPerformTransaction(amountUSD: number): boolean {
    const limits = {
      [KYCLevel.LEVEL_0]: 0,
      [KYCLevel.LEVEL_1]: 1000,
      [KYCLevel.LEVEL_2]: 10000,
      [KYCLevel.LEVEL_3]: 100000
    };

    return amountUSD <= limits[this.kycLevel];
  }

  isDeviceTrusted(deviceId: string): boolean {
    return this.trustedDevices.some(device => 
      device.deviceId === deviceId && device.isActive
    );
  }

  addTrustedDevice(deviceInfo: { deviceId: string; deviceType: string }): void {
    this.trustedDevices.push({
      ...deviceInfo,
      lastUsedAt: new Date(),
      isActive: true
    });
  }

  removeTrustedDevice(deviceId: string): void {
    this.trustedDevices = this.trustedDevices.map(device =>
      device.deviceId === deviceId
        ? { ...device, isActive: false }
        : device
    );
  }

  updateLastLogin(ip: string, deviceInfo?: any): void {
    this.lastLoginAt = new Date();
    this.lastLoginIp = ip;
    if (deviceInfo) {
      this.deviceInfo = deviceInfo;
    }
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  addRole(role: string): void {
    if (!this.roles.includes(role)) {
      this.roles.push(role);
    }
  }

  removeRole(role: string): void {
    this.roles = this.roles.filter(r => r !== role);
  }

  updatePreferences(preferences: Partial<User['preferences']>): void {
    this.preferences = {
      ...this.preferences,
      ...preferences
    };
  }

  softDelete(): void {
    this.status = UserStatus.DELETED;
    this.deletedAt = new Date();
  }
}
