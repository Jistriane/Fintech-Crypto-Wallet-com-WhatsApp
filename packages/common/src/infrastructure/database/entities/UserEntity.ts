import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { WalletEntity } from './WalletEntity';
import { KYCLevel, KYCStatus } from '../../../types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  kycStatus!: KYCStatus;

  @Column({
    type: 'enum',
    enum: KYCLevel,
    default: KYCLevel.LEVEL_0,
  })
  kycLevel!: KYCLevel;

  @Column({ default: false })
  whatsappOptIn!: boolean;

  @OneToMany(() => WalletEntity, wallet => wallet.user)
  wallets!: WalletEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial?: Partial<UserEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}