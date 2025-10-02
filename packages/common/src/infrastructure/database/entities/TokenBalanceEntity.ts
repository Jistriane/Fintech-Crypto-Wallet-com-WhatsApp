import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { Network } from '../../../types';

@Entity('token_balances')
export class TokenBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  walletId!: string;

  @Column()
  tokenAddress!: string;

  @Column()
  symbol!: string;

  @Column()
  decimals!: number;

  @Column({
    type: 'enum',
    enum: Network,
  })
  network!: Network;

  @Column('decimal', { precision: 36, scale: 18 })
  balance!: string;

  @ManyToOne(() => WalletEntity, wallet => wallet.balances)
  @JoinColumn({ name: 'walletId' })
  wallet!: WalletEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial?: Partial<TokenBalanceEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}