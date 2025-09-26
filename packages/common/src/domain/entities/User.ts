import { KYCLevel, KYCStatus } from '../../types';

export class User {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public email: string | undefined,
    public kycStatus: KYCStatus,
    public kycLevel: KYCLevel,
    public whatsappOptIn: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  public updateKYCStatus(status: KYCStatus): void {
    this.kycStatus = status;
    this.updatedAt = new Date();
  }

  public updateKYCLevel(level: KYCLevel): void {
    this.kycLevel = level;
    this.updatedAt = new Date();
  }

  public updateWhatsAppOptIn(optIn: boolean): void {
    this.whatsappOptIn = optIn;
    this.updatedAt = new Date();
  }

  public updateEmail(email: string): void {
    this.email = email;
    this.updatedAt = new Date();
  }

  public canPerformOperation(operation: string): boolean {
    const allowedOperations = {
      LEVEL_0: [],
      LEVEL_1: ['SWAP_BASIC', 'SELF_TRANSFER'],
      LEVEL_2: ['ALL_SWAPS', 'THIRD_PARTY_TRANSFER', 'LIQUIDITY_POOLS', 'FIAT_CONVERSION'],
      LEVEL_3: ['ALL_OPERATIONS', 'INSTITUTIONAL']
    };

    return allowedOperations[this.kycLevel].includes(operation);
  }
}
