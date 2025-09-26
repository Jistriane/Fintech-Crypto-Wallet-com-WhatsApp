import axios from 'axios';
import { ethers } from 'ethers';
import { Network, Token } from '@common/types';

const API_URL = process.env.LIQUIDITY_SERVICE_URL;

describe('Liquidity API', () => {
  let authToken: string;
  let userId: string;
  let walletId: string;
  let poolId: string;

  const testToken0: Token = {
    address: '0xtoken0',
    symbol: 'TOKEN0',
    decimals: 18,
    network: 'POLYGON'
  };

  const testToken1: Token = {
    address: '0xtoken1',
    symbol: 'TOKEN1',
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

    // Criar carteira
    const wallet = await global.createTestWallet(userId);
    walletId = wallet.id;

    // Mock do provider para simular saldos
    global.mockProvider.getBalance.mockResolvedValue(
      ethers.utils.parseUnits('100', 18)
    );
  });

  describe('GET /api/v1/liquidity/pools', () => {
    it('should return available pools', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/liquidity/pools`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('token0');
      expect(response.data[0]).toHaveProperty('token1');
      expect(response.data[0]).toHaveProperty('apy');

      // Salvar para outros testes
      poolId = response.data[0].id;
    });
  });

  describe('GET /api/v1/liquidity/pools/:poolId', () => {
    it('should return pool details', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/liquidity/pools/${poolId}`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', poolId);
      expect(response.data).toHaveProperty('totalSupply');
      expect(response.data).toHaveProperty('reserve0');
      expect(response.data).toHaveProperty('reserve1');
      expect(response.data).toHaveProperty('apy');
    });

    it('should return 404 for invalid pool', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act & Assert
      await expect(axios.get(
        `${API_URL}/api/v1/liquidity/pools/invalid_pool`,
        { headers }
      )).rejects.toThrow('Request failed with status code 404');
    });
  });

  describe('POST /api/v1/liquidity/add', () => {
    it('should add liquidity to pool', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        poolId,
        amount0Desired: ethers.utils.parseUnits('10', 18).toString(),
        amount1Desired: ethers.utils.parseUnits('10', 18).toString(),
        amount0Min: ethers.utils.parseUnits('9.5', 18).toString(),
        amount1Min: ethers.utils.parseUnits('9.5', 18).toString()
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/liquidity/add`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('hash');
      expect(response.data.type).toBe('LIQUIDITY_ADD');
      expect(response.data.status).toBe('PENDING');
    });

    it('should reject add with insufficient balance', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        poolId,
        amount0Desired: ethers.utils.parseUnits('1000', 18).toString(),
        amount1Desired: ethers.utils.parseUnits('1000', 18).toString(),
        amount0Min: ethers.utils.parseUnits('950', 18).toString(),
        amount1Min: ethers.utils.parseUnits('950', 18).toString()
      };

      // Mock do provider para simular saldo insuficiente
      global.mockProvider.getBalance.mockResolvedValue(
        ethers.utils.parseUnits('1', 18)
      );

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/liquidity/add`,
        data,
        { headers }
      )).rejects.toThrow('Request failed with status code 400');
    });
  });

  describe('POST /api/v1/liquidity/remove', () => {
    it('should remove liquidity from pool', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        poolId,
        liquidity: ethers.utils.parseUnits('5', 18).toString(),
        amount0Min: ethers.utils.parseUnits('4.5', 18).toString(),
        amount1Min: ethers.utils.parseUnits('4.5', 18).toString()
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/liquidity/remove`,
        data,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('hash');
      expect(response.data.type).toBe('LIQUIDITY_REMOVE');
      expect(response.data.status).toBe('PENDING');
    });

    it('should reject remove with insufficient liquidity', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const data = {
        walletId,
        poolId,
        liquidity: ethers.utils.parseUnits('1000', 18).toString(),
        amount0Min: ethers.utils.parseUnits('950', 18).toString(),
        amount1Min: ethers.utils.parseUnits('950', 18).toString()
      };

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/liquidity/remove`,
        data,
        { headers }
      )).rejects.toThrow('Request failed with status code 400');
    });
  });

  describe('GET /api/v1/liquidity/wallets/:walletId/positions', () => {
    it('should return wallet positions', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/liquidity/wallets/${walletId}/positions`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data[0]).toHaveProperty('poolId');
      expect(response.data[0]).toHaveProperty('liquidity');
      expect(response.data[0]).toHaveProperty('token0Amount');
      expect(response.data[0]).toHaveProperty('token1Amount');
      expect(response.data[0]).toHaveProperty('sharePercentage');
    });
  });

  describe('GET /api/v1/liquidity/wallets/:walletId/pools/:poolId/position', () => {
    it('should return specific pool position', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/liquidity/wallets/${walletId}/pools/${poolId}/position`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('poolId', poolId);
      expect(response.data).toHaveProperty('liquidity');
      expect(response.data).toHaveProperty('token0Amount');
      expect(response.data).toHaveProperty('token1Amount');
      expect(response.data).toHaveProperty('sharePercentage');
    });

    it('should return 404 for non-existent position', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act & Assert
      await expect(axios.get(
        `${API_URL}/api/v1/liquidity/wallets/${walletId}/pools/invalid_pool/position`,
        { headers }
      )).rejects.toThrow('Request failed with status code 404');
    });
  });
});
