import { DataSourceOptions } from 'typeorm';
import { config } from '../../config';

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  url: config.database.url,
  synchronize: false,
  logging: config.database.logging,
  entities: ['dist/infrastructure/database/entities/*.js'],
  migrations: ['dist/infrastructure/database/migrations/*.js'],
  subscribers: ['dist/infrastructure/database/subscribers/*.js'],
  ssl: config.database.ssl ? {
    rejectUnauthorized: false
  } : false
};

export const dataSourceOptions: DataSourceOptions = {
  ...baseConfig,
  name: 'default'
};
