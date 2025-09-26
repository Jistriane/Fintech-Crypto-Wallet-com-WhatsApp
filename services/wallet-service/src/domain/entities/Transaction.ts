import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Wallet, WalletNetwork } from './Wallet';

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SWAP = 'SWAP',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  CLAIM_REWARDS = 'CLAIM_REWARDS'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;

  @Column()
  hash: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amountUSD: string;

  @Column({ nullable: true })
  tokenAddress: string;

  @Column({ nullable: true })
  tokenSymbol: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: WalletNetwork })
  network: WalletNetwork;

  @Column({ type: 'jsonb', nullable: true })
  swapData?: {
    fromToken: {
      address: string;
      symbol: string;
      amount: string;
    };
    toToken: {
      address: string;
      symbol: string;
      amount: string;
    };
    route: string[];
    priceImpact: string;
    minimumReceived: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  liquidityData?: {
    pool: {
      address: string;
      name: string;
    };
    token1: {
      address: string;
      symbol: string;
      amount: string;
    };
    token2: {
      address: string;
      symbol: string;
      amount: string;
    };
    lpTokens: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  stakingData?: {
    protocol: string;
    pool: string;
    amount: string;
    rewardTokens: {
      symbol: string;
      amount: string;
    }[];
  };

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  gasPrice: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  gasLimit: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  gasUsed: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  gasFeeUSD: string;

  @Column({ nullable: true })
  nonce: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
  };

  @Column({ type: 'jsonb', default: [] })
  events: {
    timestamp: Date;
    status: TransactionStatus;
    confirmations?: number;
    error?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  whatsappNotifications: {
    sent: {
      type: string;
      timestamp: Date;
    }[];
    confirmations: {
      type: string;
      timestamp: Date;
      confirmed: boolean;
    }[];
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  confirmedAt: Date;

  // Métodos de domínio
  updateStatus(newStatus: TransactionStatus, error?: string): void {
    this.status = newStatus;
    this.events.push({
      timestamp: new Date(),
      status: newStatus,
      error
    });

    if (newStatus === TransactionStatus.CONFIRMED) {
      this.confirmedAt = new Date();
    }
  }

  addConfirmation(confirmations: number): void {
    this.events.push({
      timestamp: new Date(),
      status: this.status,
      confirmations
    });
  }

  addWhatsAppNotification(type: string): void {
    if (!this.whatsappNotifications) {
      this.whatsappNotifications = { sent: [], confirmations: [] };
    }
    this.whatsappNotifications.sent.push({
      type,
      timestamp: new Date()
    });
  }

  addWhatsAppConfirmation(type: string, confirmed: boolean): void {
    if (!this.whatsappNotifications) {
      this.whatsappNotifications = { sent: [], confirmations: [] };
    }
    this.whatsappNotifications.confirmations.push({
      type,
      timestamp: new Date(),
      confirmed
    });
  }

  calculateGasFee(): string {
    return (parseFloat(this.gasPrice) * parseFloat(this.gasUsed)).toString();
  }

  get totalCost(): string {
    const gasFee = this.calculateGasFee();
    return (parseFloat(this.amountUSD) + parseFloat(this.gasFeeUSD)).toString();
  }

  get confirmations(): number {
    const lastEvent = this.events[this.events.length - 1];
    return lastEvent?.confirmations || 0;
  }

  get isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED;
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  get isCancelled(): boolean {
    return this.status === TransactionStatus.CANCELLED;
  }

  get duration(): number {
    if (!this.confirmedAt) return 0;
    return (this.confirmedAt.getTime() - this.createdAt.getTime()) / 1000;
  }
}
