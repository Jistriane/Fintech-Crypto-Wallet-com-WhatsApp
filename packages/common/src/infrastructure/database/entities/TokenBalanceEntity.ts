import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Network } from '../../../types';
import { WalletEntity } from './WalletEntity';

@Entity('token_balances')
export class TokenBalanceEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  walletId: string;

  @Column({ length: 42 })
  tokenAddress: string;

  @Column({ length: 10 })
  symbol: string;

  @Column('int')
  decimals: number;

  @Column({
    type: 'enum',
    enum: ['POLYGON', 'BSC']
  })
  network: Network;

  @Column('numeric', { precision: 36, scale: 18 })
  balance: string;

  @ManyToOne(() => WalletEntity, wallet => wallet.balances)
  @JoinColumn({ name: 'walletId' })
  wallet: WalletEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
