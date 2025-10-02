import { WalletEncryption } from '../infrastructure/security/WalletEncryption';
import { mockLogger } from './setup';

describe('WalletEncryption', () => {
  let walletEncryption: WalletEncryption;

  beforeEach(() => {
    walletEncryption = new WalletEncryption(
      'test_master_key',
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should encrypt data successfully', async () => {
      const data = 'test_data';
      const encrypted = await walletEncryption.encrypt(data);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(data);
      expect(typeof encrypted).toBe('string');
    });

    it('should fail with invalid data', async () => {
      await expect(walletEncryption.encrypt('')).rejects.toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data correctly', async () => {
      const data = 'test_data';
      const encrypted = await walletEncryption.encrypt(data);
      const decrypted = await walletEncryption.decrypt(encrypted);

      expect(decrypted).toBe(data);
    });

    it('should fail with invalid encrypted data', async () => {
      await expect(walletEncryption.decrypt('invalid_data')).rejects.toThrow();
    });

    it('should fail with empty data', async () => {
      await expect(walletEncryption.decrypt('')).rejects.toThrow();
    });
  });

  describe('encryptAmount', () => {
    it('should encrypt amount successfully', async () => {
      const amount = BigInt('1000000000000000000'); // 1 token
      const encrypted = await walletEncryption.encryptAmount(amount);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
    });
  });

  describe('decryptAmount', () => {
    it('should decrypt amount correctly', async () => {
      const amount = BigInt('1000000000000000000'); // 1 token
      const encrypted = await walletEncryption.encryptAmount(amount);
      const decrypted = await walletEncryption.decryptAmount(encrypted);

      expect(decrypted).toBe(amount);
    });
  });

  describe('validation', () => {
    it('should validate encryption integrity', async () => {
      const data = 'test_data';
      const encrypted = await walletEncryption.encrypt(data);
      const isValid = await walletEncryption.validateEncryption(encrypted);

      expect(isValid).toBe(true);
    });

    it('should fail validation with tampered data', async () => {
      const isValid = await walletEncryption.validateEncryption('tampered_data');
      expect(isValid).toBe(false);
    });
  });
});
