import { BigNumber } from 'ethers';
import { TransactionType, TransactionStatus, Token } from '../../types';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly type: TransactionType,
    public status: TransactionStatus,
    public readonly fromAddress: string,
    public readonly toAddress: string,
    public readonly token: Token,
    public readonly amount: BigNumber,
    public hash: string | undefined,
    public failureReason: string | undefined,
    public readonly createdAt: Date,
    public confirmedAt: Date | undefined,
    public updatedAt: Date
  ) {}

  public confirm(hash: string): void {
    this.status = 'CONFIRMED';
    this.hash = hash;
    this.confirmedAt = new Date();
    this.updatedAt = new Date();
  }

  public fail(reason: string): void {
    this.status = 'FAILED';
    this.failureReason = reason;
    this.updatedAt = new Date();
  }

  public cancel(): void {
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  public isFinalized(): boolean {
    return ['CONFIRMED', 'FAILED', 'CANCELLED'].includes(this.status);
  }

  public isPending(): boolean {
    return ['PENDING', 'PROCESSING'].includes(this.status);
  }

  public getConfirmationTime(): number | undefined {
    if (!this.confirmedAt) return undefined;
    return this.confirmedAt.getTime() - this.createdAt.getTime();
  }
}
