import { DataSourceOptions } from 'typeorm';
import { UserEntity } from './packages/common/src/infrastructure/database/entities/UserEntity';
import { WalletEntity } from './packages/common/src/infrastructure/database/entities/WalletEntity';
import { TransactionEntity } from './packages/common/src/infrastructure/database/entities/TransactionEntity';
import { TokenBalanceEntity } from './packages/common/src/infrastructure/database/entities/TokenBalanceEntity';

const config: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    UserEntity,
    WalletEntity,
    TransactionEntity,
    TokenBalanceEntity
  ],
  migrations: ['migrations/*.ts'],
  subscribers: ['subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};

export default config;
