import { DataSource } from 'typeorm';
import { UserRepository } from '@common/infrastructure/repositories/UserRepository';
import { User } from '@common/domain/entities/User';
import { KYCStatus, KYCLevel } from '@common/types';

describe('UserRepository', () => {
  let dataSource: DataSource;
  let userRepository: UserRepository;

  beforeAll(async () => {
    dataSource = await global.getTestDataSource();
    userRepository = new UserRepository(dataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('create', () => {
    it('should create new user', async () => {
      // Arrange
      const user = new User(
        '123',
        '+5511999999999',
        'test@example.com',
        'PENDING',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      // Act
      const savedUser = await userRepository.create(user);

      // Assert
      expect(savedUser.id).toBe(user.id);
      expect(savedUser.phone).toBe(user.phone);
      expect(savedUser.email).toBe(user.email);
      expect(savedUser.kycStatus).toBe(user.kycStatus);
      expect(savedUser.kycLevel).toBe(user.kycLevel);
    });

    it('should reject duplicate phone', async () => {
      // Arrange
      const user1 = new User(
        '123',
        '+5511999999999',
        'test1@example.com',
        'PENDING',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      const user2 = new User(
        '456',
        '+5511999999999',
        'test2@example.com',
        'PENDING',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      await userRepository.create(user1);

      // Act & Assert
      await expect(userRepository.create(user2))
        .rejects
        .toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);

      // Act
      const foundUser = await userRepository.findById(user.id);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.phone).toBe(user.phone);
    });

    it('should return null for non-existent id', async () => {
      // Act
      const user = await userRepository.findById('nonexistent');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);

      // Act
      const foundUser = await userRepository.findByPhone(user.phone);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.phone).toBe(user.phone);
    });

    it('should return null for non-existent phone', async () => {
      // Act
      const user = await userRepository.findByPhone('+5511111111111');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);
      user.email = 'updated@example.com';
      user.whatsappOptIn = false;

      // Act
      const updatedUser = await userRepository.update(user);

      // Assert
      expect(updatedUser.email).toBe('updated@example.com');
      expect(updatedUser.whatsappOptIn).toBe(false);

      // Verify in database
      const foundUser = await userRepository.findById(user.id);
      expect(foundUser?.email).toBe('updated@example.com');
      expect(foundUser?.whatsappOptIn).toBe(false);
    });
  });

  describe('updateKYCStatus', () => {
    it('should update KYC status', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);

      // Act
      const updatedUser = await userRepository.updateKYCStatus(
        user.id,
        'APPROVED' as KYCStatus
      );

      // Assert
      expect(updatedUser.kycStatus).toBe('APPROVED');

      // Verify in database
      const foundUser = await userRepository.findById(user.id);
      expect(foundUser?.kycStatus).toBe('APPROVED');
    });
  });

  describe('updateKYCLevel', () => {
    it('should update KYC level', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);

      // Act
      const updatedUser = await userRepository.updateKYCLevel(
        user.id,
        'LEVEL_2' as KYCLevel
      );

      // Assert
      expect(updatedUser.kycLevel).toBe('LEVEL_2');

      // Verify in database
      const foundUser = await userRepository.findById(user.id);
      expect(foundUser?.kycLevel).toBe('LEVEL_2');
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      // Arrange
      const user = await global.createTestUser(dataSource);

      // Act
      await userRepository.delete(user.id);

      // Assert
      const foundUser = await userRepository.findById(user.id);
      expect(foundUser).toBeNull();
    });

    it('should not throw error for non-existent user', async () => {
      // Act & Assert
      await expect(userRepository.delete('nonexistent'))
        .resolves
        .not.toThrow();
    });
  });

  describe('findByKYCStatus', () => {
    it('should find users by KYC status', async () => {
      // Arrange
      const user1 = await global.createTestUser(dataSource);
      const user2 = await global.createTestUser(dataSource);
      await userRepository.updateKYCStatus(user1.id, 'APPROVED');

      // Act
      const approvedUsers = await userRepository.findByKYCStatus('APPROVED');
      const pendingUsers = await userRepository.findByKYCStatus('PENDING');

      // Assert
      expect(approvedUsers.length).toBe(1);
      expect(approvedUsers[0].id).toBe(user1.id);
      expect(pendingUsers.length).toBe(1);
      expect(pendingUsers[0].id).toBe(user2.id);
    });
  });

  describe('findByKYCLevel', () => {
    it('should find users by KYC level', async () => {
      // Arrange
      const user1 = await global.createTestUser(dataSource);
      const user2 = await global.createTestUser(dataSource);
      await userRepository.updateKYCLevel(user1.id, 'LEVEL_2');

      // Act
      const level2Users = await userRepository.findByKYCLevel('LEVEL_2');
      const level0Users = await userRepository.findByKYCLevel('LEVEL_0');

      // Assert
      expect(level2Users.length).toBe(1);
      expect(level2Users[0].id).toBe(user1.id);
      expect(level0Users.length).toBe(1);
      expect(level0Users[0].id).toBe(user2.id);
    });
  });
});
