import { Wallet, WalletStatus, WalletNetwork } from '../entities/Wallet';

export interface IWalletRepository {
  create(wallet: Partial<Wallet>): Promise<Wallet>;
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet[]>;
  findByAddress(address: string): Promise<Wallet | null>;
  update(id: string, data: Partial<Wallet>): Promise<Wallet>;
  delete(id: string): Promise<void>;
  findByNetwork(network: WalletNetwork): Promise<Wallet[]>;
  findByStatus(status: WalletStatus): Promise<Wallet[]>;
  updateStatus(id: string, status: WalletStatus): Promise<Wallet>;
  addTrustedAddress(id: string, address: string): Promise<Wallet>;
  removeTrustedAddress(id: string, address: string): Promise<Wallet>;
  updateSettings(id: string, settings: Partial<Wallet['settings']>): Promise<Wallet>;
  updateBackupInfo(id: string, info: Partial<Wallet['backupInfo']>): Promise<Wallet>;
  addSecurityEvent(id: string, event: string, ip: string, deviceInfo: any): Promise<Wallet>;
  findActiveWallets(): Promise<Wallet[]>;
  findInactiveWallets(daysInactive: number): Promise<Wallet[]>;
  countByNetwork(network: WalletNetwork): Promise<number>;
  countByStatus(status: WalletStatus): Promise<number>;
}
