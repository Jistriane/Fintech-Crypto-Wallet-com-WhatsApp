import { DataSource } from 'typeorm';
import { TransactionRepository } from '@common/infrastructure/repositories/TransactionRepository';
import { Transaction } from '@common/domain/entities/Transaction';
import { TransactionType, TransactionStatus, Token } from '@common/types';
import { ethers } from 'ethers';

describe('TransactionRepository', () => {
  let dataSource: DataSource;
  let transactionRepository: TransactionRepository;

  const testToken: Token = {
    address: '0xtoken',
    symbol: 'TEST',
    decimals: 18,
    network: 'POLYGON'
  };

  beforeAll(async () => {
    dataSource = await global.getTestDataSource();
    transactionRepository = new TransactionRepository(dataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create new transaction', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction = new Transaction(
        '123',
        wallet.id,
        'TRANSFER',
        'PENDING',
        wallet.address,
        '0x1234567890123456789012345678901234567890',
        testToken,
        ethers.utils.parseUnits('1', 18),
        undefined,
        undefined,
        new Date(),
        undefined,
        new Date()
      );

      // Act
      const savedTransaction = await transactionRepository.create(transaction);

      // Assert
      expect(savedTransaction.id).toBe(transaction.id);
      expect(savedTransaction.walletId).toBe(transaction.walletId);
      expect(savedTransaction.type).toBe(transaction.type);
      expect(savedTransaction.status).toBe(transaction.status);
      expect(savedTransaction.amount.eq(transaction.amount)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find transaction by id', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction = await global.createTestTransaction(dataSource, wallet.id);

      // Act
      const foundTransaction = await transactionRepository.findById(transaction.id);

      // Assert
      expect(foundTransaction).toBeDefined();
      expect(foundTransaction?.id).toBe(transaction.id);
      expect(foundTransaction?.walletId).toBe(transaction.walletId);
    });

    it('should return null for non-existent id', async () => {
      // Act
      const transaction = await transactionRepository.findById('nonexistent');

      // Assert
      expect(transaction).toBeNull();
    });
  });

  describe('findByHash', () => {
    it('should find transaction by hash', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction = await global.createTestTransaction(dataSource, wallet.id);
      const hash = '0xhash';

      await transactionRepository.update({
        ...transaction,
        hash
      });

      // Act
      const foundTransaction = await transactionRepository.findByHash(hash);

      // Assert
      expect(foundTransaction).toBeDefined();
      expect(foundTransaction?.id).toBe(transaction.id);
      expect(foundTransaction?.hash).toBe(hash);
    });

    it('should return null for non-existent hash', async () => {
      // Act
      const transaction = await transactionRepository.findByHash('0xnonexistent');

      // Assert
      expect(transaction).toBeNull();
    });
  });

  describe('findByWalletId', () => {
    it('should find transactions by wallet id', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction1 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction2 = await global.createTestTransaction(dataSource, wallet.id);

      // Act
      const transactions = await transactionRepository.findByWalletId(wallet.id);

      // Assert
      expect(transactions.length).toBe(2);
      expect(transactions.map(t => t.id)).toContain(transaction1.id);
      expect(transactions.map(t => t.id)).toContain(transaction2.id);
    });

    it('should return empty array for non-existent wallet', async () => {
      // Act
      const transactions = await transactionRepository.findByWalletId('nonexistent');

      // Assert
      expect(transactions).toEqual([]);
    });
  });

  describe('findByStatus', () => {
    it('should find transactions by status', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction1 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction2 = await global.createTestTransaction(dataSource, wallet.id);

      await transactionRepository.updateStatus(transaction1.id, 'CONFIRMED');

      // Act
      const confirmedTransactions = await transactionRepository.findByStatus('CONFIRMED');
      const pendingTransactions = await transactionRepository.findByStatus('PENDING');

      // Assert
      expect(confirmedTransactions.length).toBe(1);
      expect(confirmedTransactions[0].id).toBe(transaction1.id);
      expect(pendingTransactions.length).toBe(1);
      expect(pendingTransactions[0].id).toBe(transaction2.id);
    });
  });

  describe('findByType', () => {
    it('should find transactions by type', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction1 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction2 = await global.createTestTransaction(dataSource, wallet.id);

      await transactionRepository.update({
        ...transaction2,
        type: 'SWAP' as TransactionType
      });

      // Act
      const transferTransactions = await transactionRepository.findByType('TRANSFER');
      const swapTransactions = await transactionRepository.findByType('SWAP');

      // Assert
      expect(transferTransactions.length).toBe(1);
      expect(transferTransactions[0].id).toBe(transaction1.id);
      expect(swapTransactions.length).toBe(1);
      expect(swapTransactions[0].id).toBe(transaction2.id);
    });
  });

  describe('update', () => {
    it('should update transaction', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction = await global.createTestTransaction(dataSource, wallet.id);
      const hash = '0xhash';

      transaction.hash = hash;
      transaction.status = 'CONFIRMED';

      // Act
      const updatedTransaction = await transactionRepository.update(transaction);

      // Assert
      expect(updatedTransaction.hash).toBe(hash);
      expect(updatedTransaction.status).toBe('CONFIRMED');

      // Verify in database
      const foundTransaction = await transactionRepository.findById(transaction.id);
      expect(foundTransaction?.hash).toBe(hash);
      expect(foundTransaction?.status).toBe('CONFIRMED');
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction = await global.createTestTransaction(dataSource, wallet.id);

      // Act
      const updatedTransaction = await transactionRepository.updateStatus(
        transaction.id,
        'CONFIRMED' as TransactionStatus
      );

      // Assert
      expect(updatedTransaction.status).toBe('CONFIRMED');

      // Verify in database
      const foundTransaction = await transactionRepository.findById(transaction.id);
      expect(foundTransaction?.status).toBe('CONFIRMED');
    });
  });

  describe('findPending', () => {
    it('should find pending transactions', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      const transaction1 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction2 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction3 = await global.createTestTransaction(dataSource, wallet.id);

      await transactionRepository.updateStatus(transaction2.id, 'CONFIRMED');
      await transactionRepository.updateStatus(transaction3.id, 'PROCESSING');

      // Act
      const pendingTransactions = await transactionRepository.findPending();

      // Assert
      expect(pendingTransactions.length).toBe(2);
      expect(pendingTransactions.map(t => t.id)).toContain(transaction1.id);
      expect(pendingTransactions.map(t => t.id)).toContain(transaction3.id);
    });
  });

  describe('findByDateRange', () => {
    it('should find transactions in date range', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const transaction1 = await global.createTestTransaction(dataSource, wallet.id);
      const transaction2 = await global.createTestTransaction(dataSource, wallet.id);

      // Act
      const transactions = await transactionRepository.findByDateRange(
        pastDate,
        futureDate
      );

      // Assert
      expect(transactions.length).toBe(2);
      expect(transactions.map(t => t.id)).toContain(transaction1.id);
      expect(transactions.map(t => t.id)).toContain(transaction2.id);
    });

    it('should not find transactions outside date range', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      const wallet = await global.createTestWallet(dataSource, user.id);
      await global.createTestTransaction(dataSource, wallet.id);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      
      const moreFutureDate = new Date();
      moreFutureDate.setDate(moreFutureDate.getDate() + 4);

      // Act
      const transactions = await transactionRepository.findByDateRange(
        futureDate,
        moreFutureDate
      );

      // Assert
      expect(transactions.length).toBe(0);
    });
  });
});
