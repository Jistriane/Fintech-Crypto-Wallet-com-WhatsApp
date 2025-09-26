import { SmartWalletService } from '../domain/SmartWalletService';
import { WalletRepository } from '@common/infrastructure/repositories/WalletRepository';
import { UserRepository } from '@common/infrastructure/repositories/UserRepository';
import { TransactionRepository } from '@common/infrastructure/repositories/TransactionRepository';
import { NotusWhatsAppService } from '@common/infrastructure/whatsapp/NotusWhatsAppService';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { User } from '@common/domain/entities/User';
import { Transaction } from '@common/domain/entities/Transaction';
import { ethers } from 'ethers';

describe('SmartWalletService', () => {
  let walletService: SmartWalletService;
  let walletRepository: jest.Mocked<WalletRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let whatsappService: jest.Mocked<NotusWhatsAppService>;

  beforeEach(() => {
    // Mock dos repositórios
    walletRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByAddress: jest.fn(),
      update: jest.fn(),
      updateBalance: jest.fn(),
      delete: jest.fn(),
      findByNetwork: jest.fn(),
      findActive: jest.fn(),
      findInactive: jest.fn()
    } as any;

    userRepository = {
      findById: jest.fn(),
      findByPhone: jest.fn(),
      update: jest.fn()
    } as any;

    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByHash: jest.fn(),
      findByWalletId: jest.fn(),
      findByStatus: jest.fn(),
      findByType: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      findPending: jest.fn(),
      findByDateRange: jest.fn()
    } as any;

    whatsappService = {
      notifyWalletCreated: jest.fn(),
      notifyTransactionSent: jest.fn(),
      notifyTransactionConfirmed: jest.fn(),
      notifyTransactionFailed: jest.fn()
    } as any;

    walletService = new SmartWalletService(
      walletRepository,
      userRepository,
      transactionRepository,
      whatsappService
    );
  });

  describe('createWallet', () => {
    it('should create wallet for valid user with KYC', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      userRepository.findById.mockResolvedValue(mockUser);
      walletRepository.create.mockImplementation(wallet => wallet);

      // Act
      const wallet = await walletService.createWallet(userId, 'POLYGON');

      // Assert
      expect(wallet).toBeDefined();
      expect(wallet.userId).toBe(userId);
      expect(wallet.network).toBe('POLYGON');
      expect(wallet.isActive).toBe(true);
      expect(walletRepository.create).toHaveBeenCalled();
      expect(whatsappService.notifyWalletCreated).toHaveBeenCalledWith(
        mockUser.phone,
        userId,
        wallet.address,
        'POLYGON'
      );
    });

    it('should throw error for user without KYC', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'PENDING',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      userRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(walletService.createWallet(userId, 'POLYGON'))
        .rejects
        .toThrow('KYC level too low to create wallet');
    });
  });

  describe('transfer', () => {
    it('should create and execute valid transfer', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [{
          token: {
            address: '0xtoken',
            symbol: 'TEST',
            decimals: 18,
            network: 'POLYGON'
          },
          balance: ethers.utils.parseUnits('100', 18)
        }],
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

      const token = {
        address: '0xtoken',
        symbol: 'TEST',
        decimals: 18,
        network: 'POLYGON'
      };

      const amount = ethers.utils.parseUnits('10', 18);

      // Act
      const transaction = await walletService.transfer(
        walletId,
        '0xrecipient',
        token,
        amount
      );

      // Assert
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('TRANSFER');
      expect(transaction.status).toBe('PENDING');
      expect(transaction.amount.eq(amount)).toBe(true);
      expect(transactionRepository.create).toHaveBeenCalled();
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
        [{
          token: {
            address: '0xtoken',
            symbol: 'TEST',
            decimals: 18,
            network: 'POLYGON'
          },
          balance: ethers.utils.parseUnits('5', 18)
        }],
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

      const token = {
        address: '0xtoken',
        symbol: 'TEST',
        decimals: 18,
        network: 'POLYGON'
      };

      const amount = ethers.utils.parseUnits('10', 18);

      // Act & Assert
      await expect(walletService.transfer(walletId, '0xrecipient', token, amount))
        .rejects
        .toThrow('Insufficient balance');
    });
  });

  describe('getBalance', () => {
    it('should return current token balance', async () => {
      // Arrange
      const walletId = '123';
      const mockWallet = new SmartWallet(
        walletId,
        'user123',
        '0x1234...',
        'encrypted_key',
        'POLYGON',
        true,
        [{
          token: {
            address: '0xtoken',
            symbol: 'TEST',
            decimals: 18,
            network: 'POLYGON'
          },
          balance: ethers.utils.parseUnits('100', 18)
        }],
        new Date(),
        new Date()
      );

      walletRepository.findById.mockResolvedValue(mockWallet);

      const token = {
        address: '0xtoken',
        symbol: 'TEST',
        decimals: 18,
        network: 'POLYGON'
      };

      // Act
      const balance = await walletService.getBalance(walletId, token);

      // Assert
      expect(balance.eq(ethers.utils.parseUnits('100', 18))).toBe(true);
    });

    it('should throw error for invalid wallet', async () => {
      // Arrange
      const walletId = '123';
      walletRepository.findById.mockResolvedValue(null);

      const token = {
        address: '0xtoken',
        symbol: 'TEST',
        decimals: 18,
        network: 'POLYGON'
      };

      // Act & Assert
      await expect(walletService.getBalance(walletId, token))
        .rejects
        .toThrow('Wallet not found');
    });
  });
});
