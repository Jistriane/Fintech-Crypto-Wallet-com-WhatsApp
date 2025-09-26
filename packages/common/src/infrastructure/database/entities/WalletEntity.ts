import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Network } from '../../../types';
import { UserEntity } from './UserEntity';
import { TransactionEntity } from './TransactionEntity';
import { TokenBalanceEntity } from './TokenBalanceEntity';

@Entity('wallets')
export class WalletEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ length: 42, unique: true })
  address: string;

  @Column({ type: 'text' })
  privateKeyEncrypted: string;

  @Column({
    type: 'enum',
    enum: ['POLYGON', 'BSC'],
  })
  network: Network;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, user => user.wallets)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => TransactionEntity, transaction => transaction.wallet)
  transactions: TransactionEntity[];

  @OneToMany(() => TokenBalanceEntity, balance => balance.wallet)
  balances: TokenBalanceEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
