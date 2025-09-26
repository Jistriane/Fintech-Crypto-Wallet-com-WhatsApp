// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@postgres-test:5432/fintech_test';
process.env.REDIS_URL = 'redis://redis-test:6379';
process.env.MASTER_KEY = 'test_master_key';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NOTUS_API_KEY = 'test_notus_key';
process.env.POLYGON_RPC_URL = 'http://mock-polygon:8545';
process.env.BSC_RPC_URL = 'http://mock-bsc:8545';

// Helpers para testes
global.setupTestDatabase = async () => {
  const { DataSource } = require('typeorm');
  const { dataSourceOptions } = require('@common/infrastructure/database/ormconfig');

  const dataSource = new DataSource({
    ...dataSourceOptions,
    url: process.env.DATABASE_URL,
    synchronize: true,
    dropSchema: true
  });

  await dataSource.initialize();
  await dataSource.synchronize(true);

  return dataSource;
};

global.clearRedis = async () => {
  const { RedisCache } = require('@common/infrastructure/cache/RedisCache');
  await RedisCache.getInstance().flushall();
};

// Configuração do Jest
jest.setTimeout(30000); // 30 segundos

// Antes de cada teste
beforeEach(async () => {
  await global.setupTestDatabase();
  await global.clearRedis();
});

// Depois de cada teste
afterEach(async () => {
  await global.clearRedis();
});
