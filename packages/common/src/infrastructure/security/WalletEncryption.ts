import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { formatUnits, parseUnits } from 'ethers';
import { ILogger } from '../../domain/interfaces/ILogger';

const scryptAsync = promisify(scrypt);

export class WalletEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly saltLength = 32;
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor(
    private readonly masterKey: string,
    private readonly logger: ILogger
  ) {}

  async encrypt(data: string): Promise<string> {
    try {
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);

      const key = await scryptAsync(
        this.masterKey,
        salt,
        this.keyLength
      ) as Buffer;

      const cipher = createCipheriv(this.algorithm, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(data, 'utf8'),
        cipher.final(),
      ]);

      const authTag = cipher.getAuthTag();

      const result = Buffer.concat([
        salt,
        iv,
        authTag,
        encrypted,
      ]).toString('base64');

      return result;
    } catch (error) {
      this.logger.error('Error encrypting data', { error });
      throw new Error('Encryption failed');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');

      const salt = buffer.subarray(0, this.saltLength);
      const iv = buffer.subarray(
        this.saltLength,
        this.saltLength + this.ivLength
      );
      const authTag = buffer.subarray(
        this.saltLength + this.ivLength,
        this.saltLength + this.ivLength + this.authTagLength
      );
      const encrypted = buffer.subarray(
        this.saltLength + this.ivLength + this.authTagLength
      );

      const key = await scryptAsync(
        this.masterKey,
        salt,
        this.keyLength
      ) as Buffer;

      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error('Error decrypting data', { error });
      throw new Error('Decryption failed');
    }
  }

  async encryptPrivateKey(privateKey: string): Promise<string> {
    try {
      return await this.encrypt(privateKey);
    } catch (error) {
      this.logger.error('Error encrypting private key', { error });
      throw new Error('Private key encryption failed');
    }
  }

  async decryptPrivateKey(encryptedPrivateKey: string): Promise<string> {
    try {
      return await this.decrypt(encryptedPrivateKey);
    } catch (error) {
      this.logger.error('Error decrypting private key', { error });
      throw new Error('Private key decryption failed');
    }
  }

  async encryptAmount(amount: bigint): Promise<string> {
    try {
      const amountString = formatUnits(amount, 18);
      return await this.encrypt(amountString);
    } catch (error) {
      this.logger.error('Error encrypting amount', { error });
      throw new Error('Amount encryption failed');
    }
  }

  async decryptAmount(encryptedAmount: string): Promise<bigint> {
    try {
      const amountString = await this.decrypt(encryptedAmount);
      return parseUnits(amountString, 18);
    } catch (error) {
      this.logger.error('Error decrypting amount', { error });
      throw new Error('Amount decryption failed');
    }
  }
}