import { WalletEncryption } from '../infrastructure/security/WalletEncryption';

describe('WalletEncryption', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      MASTER_KEY: 'test_master_key_12345678901234567890123456789012'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('encryptPrivateKey', () => {
    it('should encrypt private key successfully', async () => {
      // Arrange
      const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const userId = 'user123';

      // Act
      const encrypted = await WalletEncryption.encryptPrivateKey(privateKey, userId);

      // Assert
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid private key', async () => {
      // Arrange
      const privateKey = 'invalid_key';
      const userId = 'user123';

      // Act & Assert
      await expect(WalletEncryption.encryptPrivateKey(privateKey, userId))
        .rejects
        .toThrow('Invalid private key format');
    });
  });

  describe('decryptPrivateKey', () => {
    it('should decrypt private key successfully', async () => {
      // Arrange
      const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const userId = 'user123';
      const encrypted = await WalletEncryption.encryptPrivateKey(privateKey, userId);

      // Act
      const decrypted = await WalletEncryption.decryptPrivateKey(encrypted, userId);

      // Assert
      expect(decrypted).toBe(privateKey);
    });

    it('should throw error for invalid encrypted data', async () => {
      // Arrange
      const encrypted = 'invalid_data';
      const userId = 'user123';

      // Act & Assert
      await expect(WalletEncryption.decryptPrivateKey(encrypted, userId))
        .rejects
        .toThrow('Failed to decrypt private key');
    });

    it('should throw error for wrong user ID', async () => {
      // Arrange
      const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const userId = 'user123';
      const wrongUserId = 'wrong_user';
      const encrypted = await WalletEncryption.encryptPrivateKey(privateKey, userId);

      // Act & Assert
      await expect(WalletEncryption.decryptPrivateKey(encrypted, wrongUserId))
        .rejects
        .toThrow('Failed to decrypt private key');
    });
  });

  describe('rotateKey', () => {
    it('should rotate encryption key successfully', async () => {
      // Arrange
      const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const userId = 'user123';
      const newMasterKey = 'new_master_key_12345678901234567890123456789012';
      const encrypted = await WalletEncryption.encryptPrivateKey(privateKey, userId);

      // Act
      const newEncrypted = await WalletEncryption.rotateKey(encrypted, userId, newMasterKey);
      
      // Temporarily set new master key to test decryption
      process.env.MASTER_KEY = newMasterKey;
      const decrypted = await WalletEncryption.decryptPrivateKey(newEncrypted, userId);

      // Assert
      expect(decrypted).toBe(privateKey);
    });
  });

  describe('validateEncryption', () => {
    it('should validate correct encryption', async () => {
      // Arrange
      const privateKey = '0x1234567890123456789012345678901234567890123456789012345678901234';
      const userId = 'user123';
      const encrypted = await WalletEncryption.encryptPrivateKey(privateKey, userId);

      // Act
      const isValid = await WalletEncryption.validateEncryption(encrypted, userId);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should return false for invalid encryption', async () => {
      // Arrange
      const encrypted = 'invalid_data';
      const userId = 'user123';

      // Act
      const isValid = await WalletEncryption.validateEncryption(encrypted, userId);

      // Assert
      expect(isValid).toBe(false);
    });
  });
});
