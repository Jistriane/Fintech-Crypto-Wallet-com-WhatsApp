import { ILogger } from '../../domain/interfaces/ILogger';
import { Network } from '../../types/enums';
import { RedisCache } from '../cache/RedisCache';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { AlertService } from '../security/AlertService';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import { join } from 'path';
import { mkdir } from 'fs/promises';

interface BackupConfig {
  frequency: number; // em segundos
  retentionPeriod: number; // em dias
  encryptionKey: string;
  compressionLevel: number;
  maxConcurrentBackups: number;
}

interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: BackupType;
  size: number;
  checksum: string;
  encryptionVersion: string;
  compressionAlgorithm: string;
  status: BackupStatus;
}

enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  SNAPSHOT = 'SNAPSHOT'
}

enum BackupStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED'
}

export class BackupService {
  private readonly BACKUP_METADATA_KEY = 'backup_metadata';
  private readonly BACKUP_LOCK_KEY = 'backup_lock';
  private readonly BACKUP_CONFIG_KEY = 'backup_config';
  private readonly DEFAULT_CONFIG: BackupConfig = {
    frequency: 3600, // 1 hora
    retentionPeriod: 30, // 30 dias
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
    compressionLevel: 9,
    maxConcurrentBackups: 3
  };
  private backupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly alertService: AlertService,
    private readonly cache: RedisCache,
    private readonly logger: ILogger,
    private readonly backupPath: string = process.env.BACKUP_PATH || '/var/backups/fintech'
  ) {}

  async start(): Promise<void> {
    try {
      // 1. Carrega ou cria configuração
      const config = await this.loadConfig();

      // 2. Cria diretório de backup se não existir
      await mkdir(this.backupPath, { recursive: true });

      // 3. Inicia backup automático
      this.backupInterval = setInterval(
        () => this.createBackup(BackupType.INCREMENTAL),
        config.frequency * 1000
      );

      // 4. Agenda limpeza de backups antigos
      setInterval(
        () => this.cleanOldBackups(),
        24 * 3600 * 1000 // Uma vez por dia
      );

      this.logger.info('Backup service started', { config });
    } catch (error) {
      this.logger.error('Error starting backup service', error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    this.logger.info('Backup service stopped');
  }

  private async loadConfig(): Promise<BackupConfig> {
    try {
      const config = await this.cache.get<BackupConfig>(this.BACKUP_CONFIG_KEY);
      return config || this.DEFAULT_CONFIG;
    } catch (error) {
      this.logger.error('Error loading backup config', error as Error);
      return this.DEFAULT_CONFIG;
    }
  }

  async createBackup(type: BackupType): Promise<BackupMetadata> {
    try {
      // 1. Verifica lock
      const hasLock = await this.acquireBackupLock();
      if (!hasLock) {
        throw new Error('Another backup is in progress');
      }

      // 2. Inicia metadata
      const metadata: BackupMetadata = {
        id: ethers.randomBytes(16).toString('hex'),
        timestamp: new Date(),
        type,
        size: 0,
        checksum: '',
        encryptionVersion: 'AES-256-GCM',
        compressionAlgorithm: 'gzip',
        status: BackupStatus.IN_PROGRESS
      };

      try {
        // 3. Coleta dados
        const data = await this.collectBackupData(type);

        // 4. Cria arquivo de backup
        const backupFile = join(this.backupPath, `backup_${metadata.id}.gz.enc`);
        
        // 5. Comprime e criptografa dados
        const compressedEncrypted = await this.compressAndEncrypt(
          data,
          (await this.loadConfig()).encryptionKey
        );

        // 6. Salva arquivo
        await this.saveBackupFile(compressedEncrypted, backupFile);

        // 7. Atualiza metadata
        metadata.size = compressedEncrypted.length;
        metadata.checksum = this.calculateChecksum(compressedEncrypted);
        metadata.status = BackupStatus.COMPLETED;

        // 8. Salva metadata
        await this.saveBackupMetadata(metadata);

        // 9. Verifica backup
        const isValid = await this.verifyBackup(metadata);
        if (isValid) {
          metadata.status = BackupStatus.VERIFIED;
          await this.saveBackupMetadata(metadata);
        } else {
          throw new Error('Backup verification failed');
        }

        return metadata;

      } finally {
        // Libera lock em qualquer caso
        await this.releaseBackupLock();
      }

    } catch (error) {
      this.logger.error('Error creating backup', error as Error);
      
      // Notifica erro
      await this.alertService.createAlert(
        'BACKUP_FAILED',
        'HIGH',
        {
          error: error.message,
          type,
          timestamp: new Date()
        }
      );

      throw error;
    }
  }

  private async acquireBackupLock(): Promise<boolean> {
    const lockValue = await this.cache.get<string>(this.BACKUP_LOCK_KEY);
    if (lockValue) {
      return false;
    }
    await this.cache.set(this.BACKUP_LOCK_KEY, 'locked', 3600); // 1 hora de timeout
    return true;
  }

  private async releaseBackupLock(): Promise<void> {
    await this.cache.del(this.BACKUP_LOCK_KEY);
  }

  private async collectBackupData(type: BackupType): Promise<any> {
    const data: any = {
      timestamp: new Date(),
      type,
      version: '1.0'
    };

    if (type === BackupType.FULL) {
      // Backup completo
      data.users = await this.userRepository.find({});
      data.wallets = await this.walletRepository.findAll();
      data.transactions = await this.transactionRepository.find({});
    } else {
      // Backup incremental
      const lastBackup = await this.getLastBackupMetadata();
      const fromDate = lastBackup ? lastBackup.timestamp : new Date(0);

      data.users = await this.userRepository.findModifiedSince(fromDate);
      data.wallets = await this.walletRepository.findModifiedSince(fromDate);
      data.transactions = await this.transactionRepository.findModifiedSince(fromDate);
    }

    return data;
  }

  private async compressAndEncrypt(data: any, key: string): Promise<Buffer> {
    // 1. Converte dados para string
    const jsonData = JSON.stringify(data);

    // 2. Gera IV
    const iv = crypto.randomBytes(16);

    // 3. Cria cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

    // 4. Comprime e criptografa
    const compressed = await this.compress(Buffer.from(jsonData));
    const encrypted = Buffer.concat([
      cipher.update(compressed),
      cipher.final()
    ]);

    // 5. Obtém tag de autenticação
    const authTag = cipher.getAuthTag();

    // 6. Combina IV, dados criptografados e tag
    return Buffer.concat([iv, authTag, encrypted]);
  }

  private async compress(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const gzip = createGzip({ level: 9 });

      gzip.on('data', chunk => chunks.push(chunk));
      gzip.on('end', () => resolve(Buffer.concat(chunks)));
      gzip.on('error', reject);

      gzip.write(data);
      gzip.end();
    });
  }

  private async saveBackupFile(data: Buffer, filepath: string): Promise<void> {
    await pipeline(
      createReadStream(data),
      createWriteStream(filepath)
    );
  }

  private calculateChecksum(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private async saveBackupMetadata(metadata: BackupMetadata): Promise<void> {
    try {
      const allMetadata = await this.cache.get<BackupMetadata[]>(this.BACKUP_METADATA_KEY) || [];
      const index = allMetadata.findIndex(m => m.id === metadata.id);

      if (index >= 0) {
        allMetadata[index] = metadata;
      } else {
        allMetadata.push(metadata);
      }

      await this.cache.set(this.BACKUP_METADATA_KEY, allMetadata);
    } catch (error) {
      this.logger.error('Error saving backup metadata', error as Error);
      throw error;
    }
  }

  private async getLastBackupMetadata(): Promise<BackupMetadata | null> {
    try {
      const allMetadata = await this.cache.get<BackupMetadata[]>(this.BACKUP_METADATA_KEY) || [];
      return allMetadata
        .filter(m => m.status === BackupStatus.VERIFIED)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
    } catch (error) {
      this.logger.error('Error getting last backup metadata', error as Error);
      return null;
    }
  }

  private async verifyBackup(metadata: BackupMetadata): Promise<boolean> {
    try {
      // 1. Lê arquivo
      const backupFile = join(this.backupPath, `backup_${metadata.id}.gz.enc`);
      const data = await this.readBackupFile(backupFile);

      // 2. Verifica checksum
      const checksum = this.calculateChecksum(data);
      if (checksum !== metadata.checksum) {
        throw new Error('Checksum verification failed');
      }

      // 3. Tenta descriptografar e descomprimir
      const decrypted = await this.decryptAndDecompress(
        data,
        (await this.loadConfig()).encryptionKey
      );

      // 4. Verifica se é JSON válido
      JSON.parse(decrypted.toString());

      return true;
    } catch (error) {
      this.logger.error('Backup verification failed', error as Error);
      return false;
    }
  }

  private async readBackupFile(filepath: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      createReadStream(filepath)
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => resolve(Buffer.concat(chunks)))
        .on('error', reject);
    });
  }

  private async decryptAndDecompress(data: Buffer, key: string): Promise<Buffer> {
    // 1. Extrai IV, tag e dados criptografados
    const iv = data.slice(0, 16);
    const authTag = data.slice(16, 32);
    const encrypted = data.slice(32);

    // 2. Cria decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    decipher.setAuthTag(authTag);

    // 3. Descriptografa
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    // 4. Descomprime
    return this.decompress(decrypted);
  }

  private async decompress(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const gunzip = createGzip();

      gunzip.on('data', chunk => chunks.push(chunk));
      gunzip.on('end', () => resolve(Buffer.concat(chunks)));
      gunzip.on('error', reject);

      gunzip.write(data);
      gunzip.end();
    });
  }

  private async cleanOldBackups(): Promise<void> {
    try {
      const config = await this.loadConfig();
      const allMetadata = await this.cache.get<BackupMetadata[]>(this.BACKUP_METADATA_KEY) || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);

      // Filtra backups antigos
      const oldBackups = allMetadata.filter(m => m.timestamp < cutoffDate);

      for (const backup of oldBackups) {
        try {
          // Remove arquivo
          const backupFile = join(this.backupPath, `backup_${backup.id}.gz.enc`);
          await this.deleteBackupFile(backupFile);

          // Remove metadata
          const index = allMetadata.findIndex(m => m.id === backup.id);
          if (index >= 0) {
            allMetadata.splice(index, 1);
          }
        } catch (error) {
          this.logger.error(`Error deleting old backup ${backup.id}`, error as Error);
        }
      }

      // Atualiza metadata
      await this.cache.set(this.BACKUP_METADATA_KEY, allMetadata);

    } catch (error) {
      this.logger.error('Error cleaning old backups', error as Error);
    }
  }

  private async deleteBackupFile(filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      unlink(filepath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async restoreBackup(backupId: string): Promise<void> {
    try {
      // 1. Obtém metadata do backup
      const allMetadata = await this.cache.get<BackupMetadata[]>(this.BACKUP_METADATA_KEY) || [];
      const metadata = allMetadata.find(m => m.id === backupId);
      if (!metadata) {
        throw new Error('Backup not found');
      }

      // 2. Verifica status
      if (metadata.status !== BackupStatus.VERIFIED) {
        throw new Error('Backup not verified');
      }

      // 3. Lê arquivo
      const backupFile = join(this.backupPath, `backup_${metadata.id}.gz.enc`);
      const data = await this.readBackupFile(backupFile);

      // 4. Descriptografa e descomprime
      const decrypted = await this.decryptAndDecompress(
        data,
        (await this.loadConfig()).encryptionKey
      );

      // 5. Parse dados
      const backupData = JSON.parse(decrypted.toString());

      // 6. Restaura dados
      await this.restoreData(backupData);

      // 7. Registra evento
      await this.alertService.createAlert(
        'BACKUP_RESTORED',
        'HIGH',
        {
          backupId,
          timestamp: new Date(),
          metadata
        }
      );

    } catch (error) {
      this.logger.error('Error restoring backup', error as Error);
      
      await this.alertService.createAlert(
        'BACKUP_RESTORE_FAILED',
        'CRITICAL',
        {
          backupId,
          error: error.message,
          timestamp: new Date()
        }
      );

      throw error;
    }
  }

  private async restoreData(data: any): Promise<void> {
    // TODO: Implementar restauração de dados
    // Deve ser implementado com muito cuidado para garantir consistência
    throw new Error('Restore not implemented');
  }

  async getBackupMetadata(backupId?: string): Promise<BackupMetadata | BackupMetadata[]> {
    try {
      const allMetadata = await this.cache.get<BackupMetadata[]>(this.BACKUP_METADATA_KEY) || [];
      
      if (backupId) {
        return allMetadata.find(m => m.id === backupId) || null;
      }

      return allMetadata.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      this.logger.error('Error getting backup metadata', error as Error);
      return [];
    }
  }

  async updateConfig(config: Partial<BackupConfig>): Promise<void> {
    try {
      const currentConfig = await this.loadConfig();
      const newConfig = { ...currentConfig, ...config };
      await this.cache.set(this.BACKUP_CONFIG_KEY, newConfig);

      // Reinicia serviço se frequência mudou
      if (config.frequency && this.backupInterval) {
        this.stop();
        this.start();
      }
    } catch (error) {
      this.logger.error('Error updating backup config', error as Error);
      throw error;
    }
  }
}
