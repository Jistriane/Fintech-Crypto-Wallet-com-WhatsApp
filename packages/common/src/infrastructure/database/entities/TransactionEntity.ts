import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { Network, TransactionStatus, TransactionType } from '../../../types';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
  })
  status!: TransactionStatus;

  @Column()
  fromAddress!: string;

  @Column()
  toAddress!: string;

  @Column()
  tokenAddress!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  amount!: string;

  @Column({
    type: 'enum',
    enum: Network,
  })
  network!: Network;

  @Column({ nullable: true })
  hash?: string;

  @Column({ nullable: true })
  error?: string;

  @ManyToOne(() => WalletEntity, wallet => wallet.transactions)
  @JoinColumn({ name: 'walletId' })
  wallet!: WalletEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial?: Partial<TransactionEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}