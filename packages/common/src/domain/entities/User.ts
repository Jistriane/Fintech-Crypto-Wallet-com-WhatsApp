import { KYCLevel, KYCStatus } from '../../types';

export class User {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    private _kycStatus: KYCStatus,
    private _kycLevel: KYCLevel,
    private _whatsappOptIn: boolean,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  get kycStatus(): KYCStatus {
    return this._kycStatus;
  }

  get kycLevel(): KYCLevel {
    return this._kycLevel;
  }

  get whatsappOptIn(): boolean {
    return this._whatsappOptIn;
  }

  updateKYCStatus(status: KYCStatus): void {
    this._kycStatus = status;
  }

  updateKYCLevel(level: KYCLevel): void {
    this._kycLevel = level;
  }

  setWhatsAppOptIn(optIn: boolean): void {
    this._whatsappOptIn = optIn;
  }

  canTransact(): boolean {
    return this._kycStatus === KYCStatus.APPROVED;
  }

  getTransactionLimit(): number {
    switch (this._kycLevel) {
      case KYCLevel.LEVEL_0:
        return 0;
      case KYCLevel.LEVEL_1:
        return 1000;
      case KYCLevel.LEVEL_2:
        return 10000;
      case KYCLevel.LEVEL_3:
        return 100000;
      default:
        return 0;
    }
  }
}