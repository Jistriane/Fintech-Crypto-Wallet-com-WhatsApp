// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.KYC_SERVICE_URL = 'http://kyc-test:3000';
process.env.DEFI_SERVICE_URL = 'http://defi-test:3000';
process.env.LIQUIDITY_SERVICE_URL = 'http://liquidity-test:3000';

// Helpers para testes
const axios = require('axios');
const { ethers } = require('ethers');

global.createTestUser = async () => {
  const response = await axios.post(`${process.env.KYC_SERVICE_URL}/api/v1/kyc/users`, {
    phone: '+5511999999999',
    email: 'test@example.com'
  });

  return response.data;
};

global.completeKYC = async (userId) => {
  await axios.post(`${process.env.KYC_SERVICE_URL}/api/v1/kyc/users/${userId}/documents`, {
    type: 'ID_FRONT',
    image: Buffer.from('test').toString('base64')
  });

  await axios.post(`${process.env.KYC_SERVICE_URL}/api/v1/kyc/users/${userId}/documents`, {
    type: 'ID_BACK',
    image: Buffer.from('test').toString('base64')
  });

  await axios.post(`${process.env.KYC_SERVICE_URL}/api/v1/kyc/users/${userId}/documents`, {
    type: 'SELFIE',
    image: Buffer.from('test').toString('base64')
  });
};

global.createTestWallet = async (userId) => {
  const response = await axios.post(`${process.env.DEFI_SERVICE_URL}/api/v1/defi/wallets`, {
    userId,
    network: 'POLYGON'
  });

  return response.data;
};

global.authenticate = async (phone) => {
  const response = await axios.post(`${process.env.KYC_SERVICE_URL}/api/v1/auth/login`, {
    phone
  });

  return response.data;
};

// Mock do provider blockchain
global.mockProvider = {
  getBlockNumber: jest.fn().mockResolvedValue(1000000),
  getGasPrice: jest.fn().mockResolvedValue('50000000000'),
  getBalance: jest.fn().mockResolvedValue('1000000000000000000'),
  getTransactionReceipt: jest.fn()
};

// Configuração do Jest
jest.setTimeout(10000); // 10 segundos

// Antes de cada teste
beforeEach(async () => {
  // Limpar mocks
  jest.clearAllMocks();
});

// Depois de todos os testes
afterAll(async () => {
  // Limpar recursos
});
