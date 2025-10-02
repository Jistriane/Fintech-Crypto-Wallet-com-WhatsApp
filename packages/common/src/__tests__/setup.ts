import { KYCLevel, KYCStatus, Network, TransactionStatus, TransactionType } from '../types';

// Mock do logger
export const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

// Mock do serviço WhatsApp
export const mockWhatsAppService = {
  sendMessage: jest.fn(),
  verifyNumber: jest.fn(),
  getMessageStatus: jest.fn(),
};

// Mock do repositório de usuários
export const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock do repositório de carteiras
export const mockWalletRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock do repositório de transações
export const mockTransactionRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Dados de teste
export const testUser = {
  id: '123',
  phone: '+5511999999999',
  kycStatus: KYCStatus.APPROVED,
  kycLevel: KYCLevel.LEVEL_2,
  whatsappOptIn: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const testWallet = {
  id: '456',
  userId: testUser.id,
  address: '0x123...',
  privateKeyEncrypted: 'encrypted_key',
  network: Network.POLYGON,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const testTransaction = {
  id: '789',
  walletId: testWallet.id,
  type: TransactionType.TRANSFER,
  status: TransactionStatus.COMPLETED,
  fromAddress: testWallet.address,
  toAddress: '0x456...',
  tokenAddress: '0x789...',
  amount: '1000000000000000000', // 1 token
  network: Network.POLYGON,
  createdAt: new Date(),
  updatedAt: new Date(),
};
