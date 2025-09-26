import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TokenBalance } from './TokenBalance';
import { Transaction } from './Transaction';

export enum WalletStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED'
}

export enum WalletNetwork {
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  BSC = 'BSC',
  ARBITRUM = 'ARBITRUM'
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  address: string;

  @Column({ type: 'text', select: false })
  privateKeyEncrypted: string;

  @Column({ type: 'enum', enum: WalletNetwork, default: WalletNetwork.POLYGON })
  network: WalletNetwork;

  @Column({ type: 'enum', enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Column({ default: false })
  isBackedUp: boolean;

  @Column({ type: 'jsonb', nullable: true })
  backupInfo: {
    lastBackupDate: Date;
    backupMethod: string;
    isCloudBackupEnabled: boolean;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: {
    defaultGasPrice: string;
    autoConfirmThreshold: string;
    notificationPreferences: {
      largeTransactions: boolean;
      priceAlerts: boolean;
      securityAlerts: boolean;
    };
  };

  @Column({ type: 'simple-array', default: [] })
  trustedAddresses: string[];

  @Column({ type: 'jsonb', default: [] })
  securityHistory: {
    event: string;
    timestamp: Date;
    ip: string;
    deviceInfo: any;
  }[];

  @OneToMany(() => TokenBalance, tokenBalance => tokenBalance.wallet)
  tokenBalances: TokenBalance[];

  @OneToMany(() => Transaction, transaction => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  // Métodos de domínio
  isTransactionTrusted(toAddress: string, amountUSD: number): boolean {
    return this.trustedAddresses.includes(toAddress) || amountUSD <= this.settings.autoConfirmThreshold;
  }

  needsWhatsAppConfirmation(amountUSD: number): boolean {
    return amountUSD > this.settings.autoConfirmThreshold;
  }

  addTrustedAddress(address: string): void {
    if (!this.trustedAddresses.includes(address)) {
      this.trustedAddresses.push(address);
    }
  }

  removeTrustedAddress(address: string): void {
    this.trustedAddresses = this.trustedAddresses.filter(a => a !== address);
  }

  addSecurityEvent(event: string, ip: string, deviceInfo: any): void {
    this.securityHistory.push({
      event,
      timestamp: new Date(),
      ip,
      deviceInfo
    });
  }

  updateSettings(settings: Partial<Wallet['settings']>): void {
    this.settings = {
      ...this.settings,
      ...settings
    };
  }

  updateBackupInfo(info: Partial<Wallet['backupInfo']>): void {
    this.backupInfo = {
      ...this.backupInfo,
      ...info,
      lastBackupDate: new Date()
    };
  }

  softDelete(): void {
    this.status = WalletStatus.DELETED;
    this.deletedAt = new Date();
  }

  block(reason: string): void {
    this.status = WalletStatus.BLOCKED;
    this.addSecurityEvent('WALLET_BLOCKED', '', { reason });
  }

  unblock(): void {
    this.status = WalletStatus.ACTIVE;
    this.addSecurityEvent('WALLET_UNBLOCKED', '', {});
  }
}
