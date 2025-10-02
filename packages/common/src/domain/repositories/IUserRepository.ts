import { KYCLevel, KYCStatus } from '../../types';

export interface IUserRepository {
  save(data: {
    phone: string;
    password?: string;
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  findOne(id: string): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  findByPhone(phone: string): Promise<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  find(filter: {
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<Array<{
    id: string;
    phone: string;
    password?: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    whatsappOptIn: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>>;

  update(id: string, data: {
    password?: string;
    kycStatus?: KYCStatus;
    kycLevel?: KYCLevel;
    whatsappOptIn?: boolean;
  }): Promise<void>;

  delete(id: string): Promise<void>;
}