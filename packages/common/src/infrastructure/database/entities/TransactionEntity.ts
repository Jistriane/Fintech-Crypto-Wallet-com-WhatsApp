import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionType, TransactionStatus } from '../../../types';
import { WalletEntity } from './WalletEntity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  walletId: string;

  @Column({
    type: 'enum',
    enum: ['SWAP', 'TRANSFER', 'LIQUIDITY_ADD', 'LIQUIDITY_REMOVE', 'FIAT_DEPOSIT', 'FIAT_WITHDRAWAL']
  })
  type: TransactionType;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PROCESSING', 'CONFIRMED', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  })
  status: TransactionStatus;

  @Column({ length: 42 })
  fromAddress: string;

  @Column({ length: 42 })
  toAddress: string;

  @Column({ length: 42 })
  tokenAddress: string;

  @Column('numeric', { precision: 36, scale: 18 })
  amount: string;

  @Column({ length: 66, nullable: true })
  hash?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ nullable: true })
  confirmedAt?: Date;

  @ManyToOne(() => WalletEntity, wallet => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet: WalletEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
