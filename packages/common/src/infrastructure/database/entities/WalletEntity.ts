import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { TransactionEntity } from './TransactionEntity';
import { TokenBalanceEntity } from './TokenBalanceEntity';
import { Network } from '../../../types';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  address!: string;

  @Column()
  privateKeyEncrypted!: string;

  @Column({
    type: 'enum',
    enum: Network,
  })
  network!: Network;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => UserEntity, user => user.wallets)
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @OneToMany(() => TransactionEntity, transaction => transaction.wallet)
  transactions!: TransactionEntity[];

  @OneToMany(() => TokenBalanceEntity, balance => balance.wallet)
  balances!: TokenBalanceEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial?: Partial<WalletEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}