import { Network, TransactionStatus, TransactionType } from '../../types';

export interface ITransactionRepository {
  save(data: {
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
  }): Promise<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;

  findOne(id: string): Promise<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  find(filter: {
    walletId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    network?: Network;
    createdAt?: {
      $gte?: Date;
      $lte?: Date;
    };
  }): Promise<Array<{
    id: string;
    walletId: string;
    type: TransactionType;
    status: TransactionStatus;
    fromAddress: string;
    toAddress: string;
    tokenAddress: string;
    amount: string;
    network: Network;
    hash?: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
  }>>;

  update(id: string, data: {
    status?: TransactionStatus;
    hash?: string;
    error?: string;
  }): Promise<void>;
}