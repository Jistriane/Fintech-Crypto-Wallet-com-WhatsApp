import { DataSource } from 'typeorm';
import { WalletRepository } from '@common/infrastructure/repositories/WalletRepository';
import { SmartWallet } from '@common/domain/entities/SmartWallet';
import { Network, Token } from '@common/types';
import { ethers } from 'ethers';

describe('WalletRepository', () => {
  let dataSource: DataSource;
  let walletRepository: WalletRepository;

  const testToken: Token = {
    address: '0xtoken',
    symbol: 'TEST',
    decimals: 18,
    network: 'POLYGON'
  };

  beforeAll(async () => {
    dataSource = await global.getTestDataSource();
    walletRepository = new WalletRepository(dataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create new wallet', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = new SmartWallet(
        '123',
        user.id,
        '0x1234567890123456789012345678901234567890',
        'encrypted_key',
        'POLYGON',
        true,
        [],
        new Date(),
        new Date()
      );

      // Act
      const savedWallet = await walletRepository.create(wallet);

      // Assert
      expect(savedWallet.id).toBe(wallet.id);
      expect(savedWallet.userId).toBe(wallet.userId);
      expect(savedWallet.address).toBe(wallet.address);
      expect(savedWallet.network).toBe(wallet.network);
    });

    it('should reject duplicate address', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet1 = new SmartWallet(
        '123',
        user.id,
        '0x1234567890123456789012345678901234567890',
        'encrypted_key1',
        'POLYGON',
        true,
        [],
        new Date(),
        new Date()
      );

      const wallet2 = new SmartWallet(
        '456',
        user.id,
        '0x1234567890123456789012345678901234567890',
        'encrypted_key2',
        'POLYGON',
        true,
        [],
        new Date(),
        new Date()
      );

      await walletRepository.create(wallet1);

      // Act & Assert
      await expect(walletRepository.create(wallet2))
        .rejects
        .toThrow();
    });
  });

  describe('findById', () => {
    it('should find wallet by id', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);

      // Act
      const foundWallet = await walletRepository.findById(wallet.id);

      // Assert
      expect(foundWallet).toBeDefined();
      expect(foundWallet?.id).toBe(wallet.id);
      expect(foundWallet?.address).toBe(wallet.address);
    });

    it('should return null for non-existent id', async () => {
      // Act
      const wallet = await walletRepository.findById('nonexistent');

      // Assert
      expect(wallet).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find wallets by user id', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet1 = await global.createTestWallet(dataSource, user.id);
      const wallet2 = await global.createTestWallet(dataSource, user.id);

      // Act
      const wallets = await walletRepository.findByUserId(user.id);

      // Assert
      expect(wallets.length).toBe(2);
      expect(wallets.map(w => w.id)).toContain(wallet1.id);
      expect(wallets.map(w => w.id)).toContain(wallet2.id);
    });

    it('should return empty array for non-existent user', async () => {
      // Act
      const wallets = await walletRepository.findByUserId('nonexistent');

      // Assert
      expect(wallets).toEqual([]);
    });
  });

  describe('findByAddress', () => {
    it('should find wallet by address', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);

      // Act
      const foundWallet = await walletRepository.findByAddress(wallet.address);

      // Assert
      expect(foundWallet).toBeDefined();
      expect(foundWallet?.id).toBe(wallet.id);
      expect(foundWallet?.address).toBe(wallet.address);
    });

    it('should return null for non-existent address', async () => {
      // Act
      const wallet = await walletRepository.findByAddress('0x1234');

      // Assert
      expect(wallet).toBeNull();
    });
  });

  describe('update', () => {
    it('should update wallet', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      wallet.isActive = false;

      // Act
      const updatedWallet = await walletRepository.update(wallet);

      // Assert
      expect(updatedWallet.isActive).toBe(false);

      // Verify in database
      const foundWallet = await walletRepository.findById(wallet.id);
      expect(foundWallet?.isActive).toBe(false);
    });
  });

  describe('updateBalance', () => {
    it('should update token balance', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const amount = ethers.utils.parseUnits('100', 18);

      // Act
      const updatedWallet = await walletRepository.updateBalance(
        wallet.id,
        testToken,
        amount
      );

      // Assert
      expect(updatedWallet.balances.length).toBe(1);
      expect(updatedWallet.balances[0].token.address).toBe(testToken.address);
      expect(updatedWallet.balances[0].balance.eq(amount)).toBe(true);

      // Verify in database
      const foundWallet = await walletRepository.findById(wallet.id);
      expect(foundWallet?.balances.length).toBe(1);
      expect(foundWallet?.balances[0].token.address).toBe(testToken.address);
      expect(foundWallet?.balances[0].balance.eq(amount)).toBe(true);
    });

    it('should update existing token balance', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const amount1 = ethers.utils.parseUnits('100', 18);
      const amount2 = ethers.utils.parseUnits('200', 18);

      await walletRepository.updateBalance(wallet.id, testToken, amount1);

      // Act
      const updatedWallet = await walletRepository.updateBalance(
        wallet.id,
        testToken,
        amount2
      );

      // Assert
      expect(updatedWallet.balances.length).toBe(1);
      expect(updatedWallet.balances[0].balance.eq(amount2)).toBe(true);
    });
  });

  describe('findByNetwork', () => {
    it('should find wallets by network', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet1 = await global.createTestWallet(dataSource, user.id);
      const wallet2 = await global.createTestWallet(dataSource, user.id);

      // Act
      const wallets = await walletRepository.findByNetwork('POLYGON');

      // Assert
      expect(wallets.length).toBe(2);
      expect(wallets.map(w => w.id)).toContain(wallet1.id);
      expect(wallets.map(w => w.id)).toContain(wallet2.id);
    });

    it('should return empty array for non-existent network', async () => {
      // Act
      const wallets = await walletRepository.findByNetwork('INVALID' as Network);

      // Assert
      expect(wallets).toEqual([]);
    });
  });

  describe('findActive/findInactive', () => {
    it('should find active and inactive wallets', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet1 = await global.createTestWallet(dataSource, user.id);
      const wallet2 = await global.createTestWallet(dataSource, user.id);

      await walletRepository.update({
        ...wallet2,
        isActive: false
      });

      // Act
      const activeWallets = await walletRepository.findActive();
      const inactiveWallets = await walletRepository.findInactive();

      // Assert
      expect(activeWallets.length).toBe(1);
      expect(activeWallets[0].id).toBe(wallet1.id);
      expect(inactiveWallets.length).toBe(1);
      expect(inactiveWallets[0].id).toBe(wallet2.id);
    });
  });
});
