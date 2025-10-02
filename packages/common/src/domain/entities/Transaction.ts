import { BigNumberish } from 'ethers';
import { Network, TransactionStatus, TransactionType } from '../../types';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly type: TransactionType,
    private _status: TransactionStatus,
    public readonly fromAddress: string,
    public readonly toAddress: string,
    public readonly tokenAddress: string,
    public readonly amount: BigNumberish,
    public readonly network: Network,
    public readonly hash?: string,
    public readonly error?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  get status(): TransactionStatus {
    return this._status;
  }

  confirm(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error('Transaction can only be confirmed from pending state');
    }
    this._status = TransactionStatus.COMPLETED;
  }

  fail(error: string): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error('Transaction can only fail from pending state');
    }
    this._status = TransactionStatus.FAILED;
  }

  cancel(): void {
    if (this._status !== TransactionStatus.PENDING) {
      throw new Error('Transaction can only be cancelled from pending state');
    }
    this._status = TransactionStatus.CANCELLED;
  }

  isPending(): boolean {
    return this._status === TransactionStatus.PENDING;
  }

  isCompleted(): boolean {
    return this._status === TransactionStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this._status === TransactionStatus.FAILED;
  }

  isCancelled(): boolean {
    return this._status === TransactionStatus.CANCELLED;
  }
}