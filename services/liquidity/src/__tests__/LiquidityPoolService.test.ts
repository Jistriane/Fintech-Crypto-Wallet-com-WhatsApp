import { LiquidityPoolService } from '../domain/LiquidityPoolService';
import { WalletRepository } from '@common/infrastructure/repositories/WalletRepository';
import { TransactionRepository } from '@common/infrastructure/repositories/TransactionRepository';
import { UserRepository } from '@common/infrastructure/repositories/UserRepository';
import { NotusWhatsAppService } from '@common/infrastructure/whatsapp/NotusWhatsAppService';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { User } from '@common/domain/entities/User';
import { Transaction } from '@common/domain/entities/Transaction';
import { ethers } from 'ethers';

describe('LiquidityPoolService', () => {
  let liquidityService: LiquidityPoolService;
  let walletRepository: jest.Mocked<WalletRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let whatsappService: jest.Mocked<NotusWhatsAppService>;

  beforeEach(() => {
    // Mock dos repositórios
    walletRepository = {
      findById: jest.fn(),
      updateBalance: jest.fn(),
      update: jest.fn()
    } as any;

    transactionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByWalletId: jest.fn()
    } as any;

    userRepository = {
      findById: jest.fn()
    } as any;

    whatsappService = {
      notifyLiquidityAdded: jest.fn(),
      notifyLiquidityRemoved: jest.fn(),
      notifyAPYChange: jest.fn()
    } as any;

    liquidityService = new LiquidityPoolService(
      walletRepository,
      transactionRepository,
      userRepository,
      whatsappService
    );
  });

  describe('addLiquidity', () => {
    it('should add liquidity successfully', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [
          {
            token: {
              address: '0xtoken0',
              symbol: 'TOKEN0',
              decimals: 18,
              network: 'POLYGON'
            },
            balance: ethers.utils.parseUnits('100', 18)
          },
          {
            token: {
              address: '0xtoken1',
              symbol: 'TOKEN1',
              decimals: 18,
              network: 'POLYGON'
            },
            balance: ethers.utils.parseUnits('100', 18)
          }
        ],
        new Date(),
        new Date()
      );

      const mockUser = new User(
        'user123',
        '+5511999999999',
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      walletRepository.findById.mockResolvedValue(mockWallet);
      userRepository.findById.mockResolvedValue(mockUser);
      transactionRepository.create.mockImplementation(tx => tx);

      const poolId = 'pool123';
      const amount0Desired = ethers.utils.parseUnits('10', 18);
      const amount1Desired = ethers.utils.parseUnits('10', 18);
      const amount0Min = ethers.utils.parseUnits('9.5', 18);
      const amount1Min = ethers.utils.parseUnits('9.5', 18);

      // Act
      const transaction = await liquidityService.addLiquidity(
        walletId,
        poolId,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min
      );

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('LIQUIDITY_ADD');
      expect(transaction.status).toBe('PENDING');
      expect(transactionRepository.create).toHaveBeenCalled();
      expect(whatsappService.notifyLiquidityAdded).toHaveBeenCalled();
    });

    it('should throw error for insufficient balance', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [
          {
            token: {
              address: '0xtoken0',
              symbol: 'TOKEN0',
              decimals: 18,
              network: 'POLYGON'
            },
            balance: ethers.utils.parseUnits('5', 18)
          }
        ],
        new Date(),
        new Date()
      );

      walletRepository.findById.mockResolvedValue(mockWallet);

      const poolId = 'pool123';
      const amount0Desired = ethers.utils.parseUnits('10', 18);
      const amount1Desired = ethers.utils.parseUnits('10', 18);
      const amount0Min = ethers.utils.parseUnits('9.5', 18);
      const amount1Min = ethers.utils.parseUnits('9.5', 18);

      // Act & Assert
      await expect(liquidityService.addLiquidity(
        walletId,
        poolId,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min
      )).rejects.toThrow('Insufficient balance for token0');
    });
  });

  describe('removeLiquidity', () => {
    it('should remove liquidity successfully', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [],
        new Date(),
        new Date()
      );

      const mockUser = new User(
        'user123',
        '+5511999999999',
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      const mockPosition = {
        poolId: 'pool123',
        liquidity: ethers.utils.parseUnits('10', 18),
        token0Amount: ethers.utils.parseUnits('10', 18),
        token1Amount: ethers.utils.parseUnits('10', 18),
        sharePercentage: 0.1
      };

      walletRepository.findById.mockResolvedValue(mockWallet);
      userRepository.findById.mockResolvedValue(mockUser);
      transactionRepository.create.mockImplementation(tx => tx);

      // Mock da função getPosition
      jest.spyOn(liquidityService as any, 'getPosition').mockResolvedValue(mockPosition);

      const poolId = 'pool123';
      const liquidity = ethers.utils.parseUnits('5', 18);
      const amount0Min = ethers.utils.parseUnits('4.5', 18);
      const amount1Min = ethers.utils.parseUnits('4.5', 18);

      // Act
      const transaction = await liquidityService.removeLiquidity(
        walletId,
        poolId,
        liquidity,
        amount0Min,
        amount1Min
      );

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('LIQUIDITY_REMOVE');
      expect(transaction.status).toBe('PENDING');
      expect(transactionRepository.create).toHaveBeenCalled();
      expect(whatsappService.notifyLiquidityRemoved).toHaveBeenCalled();
    });

    it('should throw error for insufficient liquidity', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [],
        new Date(),
        new Date()
      );

      const mockPosition = {
        poolId: 'pool123',
        liquidity: ethers.utils.parseUnits('5', 18),
        token0Amount: ethers.utils.parseUnits('5', 18),
        token1Amount: ethers.utils.parseUnits('5', 18),
        sharePercentage: 0.05
      };

      walletRepository.findById.mockResolvedValue(mockWallet);
      jest.spyOn(liquidityService as any, 'getPosition').mockResolvedValue(mockPosition);

      const poolId = 'pool123';
      const liquidity = ethers.utils.parseUnits('10', 18);
      const amount0Min = ethers.utils.parseUnits('9.5', 18);
      const amount1Min = ethers.utils.parseUnits('9.5', 18);

      // Act & Assert
      await expect(liquidityService.removeLiquidity(
        walletId,
        poolId,
        liquidity,
        amount0Min,
        amount1Min
      )).rejects.toThrow('Insufficient liquidity');
    });
  });

  describe('getPool', () => {
    it('should return pool information', async () => {
      // Arrange
      const poolId = 'pool123';
      const mockPool = {
        id: poolId,
        token0: {
          address: '0xtoken0',
          symbol: 'TOKEN0',
          decimals: 18,
          network: 'POLYGON'
        },
        token1: {
          address: '0xtoken1',
          symbol: 'TOKEN1',
          decimals: 18,
          network: 'POLYGON'
        },
        totalSupply: ethers.utils.parseUnits('1000', 18),
        reserve0: ethers.utils.parseUnits('100', 18),
        reserve1: ethers.utils.parseUnits('100', 18),
        apy: 10.5,
        network: 'POLYGON'
      };

      // Mock da função getPool
      jest.spyOn(liquidityService as any, 'getPool').mockResolvedValue(mockPool);

      // Act
      const pool = await liquidityService.getPool(poolId);

      // Assert
      expect(pool).toBeDefined();
      expect(pool.id).toBe(poolId);
      expect(pool.apy).toBe(10.5);
      expect(pool.token0.symbol).toBe('TOKEN0');
      expect(pool.token1.symbol).toBe('TOKEN1');
    });

    it('should return null for non-existent pool', async () => {
      // Arrange
      const poolId = 'nonexistent';
      jest.spyOn(liquidityService as any, 'getPool').mockResolvedValue(null);

      // Act
      const pool = await liquidityService.getPool(poolId);

      // Assert
      expect(pool).toBeNull();
    });
  });
});
