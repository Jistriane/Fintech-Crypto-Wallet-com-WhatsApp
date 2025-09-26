import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { KYCLevel, KYCStatus } from '../../../types';
import { WalletEntity } from './WalletEntity';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  })
  kycStatus: KYCStatus;

  @Column({
    type: 'enum',
    enum: ['LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3'],
    default: 'LEVEL_0'
  })
  kycLevel: KYCLevel;

  @Column({ default: true })
  whatsappOptIn: boolean;

  @OneToMany(() => WalletEntity, wallet => wallet.user)
  wallets: WalletEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
