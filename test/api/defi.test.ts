import axios from 'axios';
import { ethers } from 'ethers';
import { Network, Token } from '@common/types';

const API_URL = process.env.DEFI_SERVICE_URL;

describe('DeFi API', () => {
  let authToken: string;
  let userId: string;
  let walletId: string;

  const testToken: Token = {
    address: '0xtoken',
    symbol: 'TEST',
    decimals: 18,
    network: 'POLYGON'
  };

  beforeAll(async () => {
    // Criar e preparar usuário de teste
    const user = await global.createTestUser();
    userId = user.id;
    await global.completeKYC(userId);

    // Autenticar
    const auth = await global.authenticate(user.phone);
    authToken = auth.token;
  });

  describe('POST /api/v1/defi/wallets', () => {
    it('should create new wallet', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        userId,
        network: 'POLYGON' as Network
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/defi/wallets`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('address');
      expect(response.data.network).toBe('POLYGON');
      expect(response.data.isActive).toBe(true);

      // Salvar para outros testes
      walletId = response.data.id;
    });

    it('should reject creation for user without KYC', async () => {
      // Arrange
      const newUser = await global.createTestUser();
      const auth = await global.authenticate(newUser.phone);
      const headers = { Authorization: `Bearer ${auth.token}` };
      
      const data = {
        userId: newUser.id,
        network: 'POLYGON' as Network
      };

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/defi/wallets`,
        data,
        { headers }
      )).rejects.toThrow('Request failed with status code 403');
    });
  });

  describe('POST /api/v1/defi/wallets/:walletId/transfer', () => {
    it('should create transfer transaction', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        toAddress: '0x1234567890123456789012345678901234567890',
        token: testToken,
        amount: ethers.utils.parseUnits('1', 18).toString()
      };

      // Mock do provider para simular saldo
      global.mockProvider.getBalance.mockResolvedValue(
        ethers.utils.parseUnits('10', 18)
      );

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/defi/wallets/${walletId}/transfer`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('hash');
      expect(response.data.type).toBe('TRANSFER');
      expect(response.data.status).toBe('PENDING');
    });

    it('should reject transfer exceeding balance', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        toAddress: '0x1234567890123456789012345678901234567890',
        token: testToken,
        amount: ethers.utils.parseUnits('100', 18).toString()
      };

      // Mock do provider para simular saldo insuficiente
      global.mockProvider.getBalance.mockResolvedValue(
        ethers.utils.parseUnits('1', 18)
      );

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/defi/wallets/${walletId}/transfer`,
        data,
        { headers }
      )).rejects.toThrow('Request failed with status code 400');
    });
  });

  describe('POST /api/v1/defi/swap/quote', () => {
    it('should return swap quote', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        tokenIn: testToken,
        tokenOut: {
          ...testToken,
          symbol: 'TEST2',
          address: '0xtoken2'
        },
        amountIn: ethers.utils.parseUnits('1', 18).toString()
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/defi/swap/quote`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('amountOut');
      expect(response.data).toHaveProperty('priceImpact');
      expect(response.data).toHaveProperty('fee');
    });
  });

  describe('POST /api/v1/defi/swap/execute', () => {
    it('should execute swap', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        tokenIn: testToken,
        tokenOut: {
          ...testToken,
          symbol: 'TEST2',
          address: '0xtoken2'
        },
        amountIn: ethers.utils.parseUnits('1', 18).toString(),
        minAmountOut: ethers.utils.parseUnits('0.95', 18).toString()
      };

      // Mock do provider para simular saldo
      global.mockProvider.getBalance.mockResolvedValue(
        ethers.utils.parseUnits('10', 18)
      );

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/defi/swap/execute`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('hash');
      expect(response.data.type).toBe('SWAP');
      expect(response.data.status).toBe('PENDING');
    });

    it('should reject swap with high slippage', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        tokenIn: testToken,
        tokenOut: {
          ...testToken,
          symbol: 'TEST2',
          address: '0xtoken2'
        },
        amountIn: ethers.utils.parseUnits('1', 18).toString(),
        minAmountOut: ethers.utils.parseUnits('0.99', 18).toString()
      };

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/defi/swap/execute`,
        data,
        { headers }
      )).rejects.toThrow('Request failed with status code 400');
    });
  });

  describe('GET /api/v1/defi/wallets/:walletId/balance', () => {
    it('should return wallet balance', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Mock do provider
      global.mockProvider.getBalance.mockResolvedValue(
        ethers.utils.parseUnits('10', 18)
      );

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/defi/wallets/${walletId}/balance?token=${testToken.address}`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('balance');
      expect(response.data.token.address).toBe(testToken.address);
    });
  });

  describe('GET /api/v1/defi/wallets/:walletId/transactions', () => {
    it('should return transaction history', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/defi/wallets/${walletId}/transactions`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/defi/wallets/${walletId}/transactions?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      response.data.forEach(tx => {
        const txDate = new Date(tx.createdAt);
        expect(txDate >= startDate && txDate <= endDate).toBe(true);
      });
    });
  });
});
