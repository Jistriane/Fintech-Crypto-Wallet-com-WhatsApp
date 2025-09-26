// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@postgres-test:5432/fintech_test';

// Helpers para testes
const { DataSource } = require('typeorm');
const { dataSourceOptions } = require('@common/infrastructure/database/ormconfig');

global.getTestDataSource = async () => {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    url: process.env.DATABASE_URL,
    synchronize: true,
    dropSchema: true
  });

  await dataSource.initialize();
  return dataSource;
};

global.createTestUser = async (dataSource) => {
  const userRepository = dataSource.getRepository('UserEntity');
  return await userRepository.save({
    id: '123',
    phone: '+5511999999999',
    email: 'test@example.com',
    kycStatus: 'APPROVED',
    kycLevel: 'LEVEL_2',
    whatsappOptIn: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

global.createTestWallet = async (dataSource, userId) => {
  const walletRepository = dataSource.getRepository('WalletEntity');
  return await walletRepository.save({
    id: '456',
    userId,
    address: '0x1234567890123456789012345678901234567890',
    privateKeyEncrypted: 'encrypted_key',
    network: 'POLYGON',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

global.createTestTransaction = async (dataSource, walletId) => {
  const transactionRepository = dataSource.getRepository('TransactionEntity');
  return await transactionRepository.save({
    id: '789',
    walletId,
    type: 'TRANSFER',
    status: 'PENDING',
    fromAddress: '0x1234567890123456789012345678901234567890',
    toAddress: '0x0987654321098765432109876543210987654321',
    tokenAddress: '0xtoken',
    amount: '1000000000000000000',
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Configuração do Jest
jest.setTimeout(5000); // 5 segundos

let dataSource;

// Antes de todos os testes
beforeAll(async () => {
  dataSource = await global.getTestDataSource();
});

// Antes de cada teste
beforeEach(async () => {
  await dataSource.synchronize(true);
});

// Depois de todos os testes
afterAll(async () => {
  if (dataSource) {
    await dataSource.destroy();
  }
});
