import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { ethers } from 'ethers';

const scryptAsync = promisify(scrypt);

export class WalletEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly SALT_LENGTH = 32;
  private static readonly IV_LENGTH = 12;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly ENCODING = 'hex';

  private static async deriveKey(
    masterKey: string,
    salt: Buffer
  ): Promise<Buffer> {
    return await scryptAsync(
      masterKey,
      salt,
      WalletEncryption.KEY_LENGTH,
      {
        N: 32768,
        r: 8,
        p: 1
      }
    ) as Buffer;
  }

  static async encryptPrivateKey(
    privateKey: string,
    userId: string
  ): Promise<string> {
    try {
      // Validar chave privada
      if (!ethers.utils.isHexString(privateKey, 32)) {
        throw new Error('Invalid private key format');
      }

      // Gerar salt único por usuário
      const salt = randomBytes(WalletEncryption.SALT_LENGTH);
      
      // Derivar chave de criptografia
      const key = await WalletEncryption.deriveKey(
        process.env.MASTER_KEY!,
        Buffer.concat([salt, Buffer.from(userId)])
      );

      // Gerar IV
      const iv = randomBytes(WalletEncryption.IV_LENGTH);

      // Criar cipher
      const cipher = createCipheriv(
        WalletEncryption.ALGORITHM,
        key,
        iv,
        { authTagLength: WalletEncryption.AUTH_TAG_LENGTH }
      );

      // Criptografar
      const encrypted = Buffer.concat([
        cipher.update(privateKey, 'utf8'),
        cipher.final()
      ]);

      // Obter tag de autenticação
      const authTag = cipher.getAuthTag();

      // Combinar componentes
      const combined = Buffer.concat([
        salt,
        iv,
        authTag,
        encrypted
      ]);

      return combined.toString(WalletEncryption.ENCODING);
    } catch (error) {
      throw new Error(`Failed to encrypt private key: ${error.message}`);
    }
  }

  static async decryptPrivateKey(
    encryptedData: string,
    userId: string
  ): Promise<string> {
    try {
      // Converter dados criptografados
      const data = Buffer.from(encryptedData, WalletEncryption.ENCODING);

      // Extrair componentes
      const salt = data.slice(0, WalletEncryption.SALT_LENGTH);
      const iv = data.slice(
        WalletEncryption.SALT_LENGTH,
        WalletEncryption.SALT_LENGTH + WalletEncryption.IV_LENGTH
      );
      const authTag = data.slice(
        WalletEncryption.SALT_LENGTH + WalletEncryption.IV_LENGTH,
        WalletEncryption.SALT_LENGTH + WalletEncryption.IV_LENGTH + WalletEncryption.AUTH_TAG_LENGTH
      );
      const encrypted = data.slice(
        WalletEncryption.SALT_LENGTH + WalletEncryption.IV_LENGTH + WalletEncryption.AUTH_TAG_LENGTH
      );

      // Derivar chave
      const key = await WalletEncryption.deriveKey(
        process.env.MASTER_KEY!,
        Buffer.concat([salt, Buffer.from(userId)])
      );

      // Criar decipher
      const decipher = createDecipheriv(
        WalletEncryption.ALGORITHM,
        key,
        iv,
        { authTagLength: WalletEncryption.AUTH_TAG_LENGTH }
      );

      // Definir tag de autenticação
      decipher.setAuthTag(authTag);

      // Descriptografar
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      const privateKey = decrypted.toString('utf8');

      // Validar chave privada
      if (!ethers.utils.isHexString(privateKey, 32)) {
        throw new Error('Decrypted data is not a valid private key');
      }

      return privateKey;
    } catch (error) {
      throw new Error(`Failed to decrypt private key: ${error.message}`);
    }
  }

  static async rotateKey(
    encryptedData: string,
    userId: string,
    newMasterKey: string
  ): Promise<string> {
    // Descriptografar com chave antiga
    const privateKey = await WalletEncryption.decryptPrivateKey(
      encryptedData,
      userId
    );

    // Salvar chave antiga temporariamente
    const oldMasterKey = process.env.MASTER_KEY;
    
    try {
      // Usar nova chave mestra
      process.env.MASTER_KEY = newMasterKey;

      // Criptografar com nova chave
      return await WalletEncryption.encryptPrivateKey(privateKey, userId);
    } finally {
      // Restaurar chave antiga
      process.env.MASTER_KEY = oldMasterKey;
    }
  }

  static async validateEncryption(
    encryptedData: string,
    userId: string
  ): Promise<boolean> {
    try {
      const privateKey = await WalletEncryption.decryptPrivateKey(
        encryptedData,
        userId
      );
      return ethers.utils.isHexString(privateKey, 32);
    } catch {
      return false;
    }
  }
}
