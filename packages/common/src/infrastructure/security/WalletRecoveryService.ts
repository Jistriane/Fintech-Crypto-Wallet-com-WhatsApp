import { ethers, Wallet } from 'ethers';
import { ILogger } from '../../domain/interfaces/ILogger';
import { Network, TransactionType, TransactionStatus, WhatsAppPriority } from '../../types/enums';
import { BlockchainProvider } from '../blockchain/providers/BlockchainProvider';
import { RedisCache } from '../cache/RedisCache';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { WalletEncryption } from './WalletEncryption';
import { AlertService } from './AlertService';
import { MainnetSecurityService } from './MainnetSecurityService';

interface RecoveryRequest {
  id: string;
  walletId: string;
  userId: string;
  type: RecoveryType;
  status: RecoveryStatus;
  newAddress?: string;
  guardianApprovals: string[];
  createdAt: Date;
  expiresAt: Date;
  completedAt?: Date;
}

enum RecoveryType {
  GUARDIAN_TRANSFER = 'GUARDIAN_TRANSFER',
  SOCIAL_RECOVERY = 'SOCIAL_RECOVERY',
  EMERGENCY_FREEZE = 'EMERGENCY_FREEZE',
  MASTER_KEY_RECOVERY = 'MASTER_KEY_RECOVERY'
}

enum RecoveryStatus {
  PENDING = 'PENDING',
  AWAITING_APPROVALS = 'AWAITING_APPROVALS',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export class WalletRecoveryService {
  private readonly RECOVERY_CACHE_KEY = 'wallet_recovery_requests';
  private readonly RECOVERY_TTL = 86400; // 24 horas
  private readonly APPROVAL_THRESHOLD = 2; // Número mínimo de guardiões necessários
  private readonly RECOVERY_EXPIRATION = 3600 * 24; // 24 horas em segundos
  private readonly EMERGENCY_FREEZE_DURATION = 3600 * 72; // 72 horas em segundos

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly whatsappService: NotusWhatsAppService,
    private readonly alertService: AlertService,
    private readonly securityService: MainnetSecurityService,
    private readonly cache: RedisCache,
    private readonly logger: ILogger
  ) {}

  async initiateRecovery(
    userId: string,
    walletId: string,
    type: RecoveryType,
    newAddress?: string
  ): Promise<RecoveryRequest> {
    try {
      // 1. Validações iniciais
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const wallet = await this.walletRepository.findOne(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // 2. Verifica se já existe um processo de recuperação ativo
      const activeRequest = await this.getActiveRecoveryRequest(walletId);
      if (activeRequest) {
        throw new Error('Active recovery request already exists');
      }

      // 3. Cria nova solicitação de recuperação
      const request: RecoveryRequest = {
        id: ethers.randomBytes(16).toString('hex'),
        walletId,
        userId,
        type,
        status: RecoveryStatus.PENDING,
        newAddress,
        guardianApprovals: [],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.RECOVERY_EXPIRATION * 1000)
      };

      // 4. Salva a solicitação
      await this.saveRecoveryRequest(request);

      // 5. Notifica guardiões
      await this.notifyGuardians(wallet, request);

      // 6. Se for congelamento de emergência, executa imediatamente
      if (type === RecoveryType.EMERGENCY_FREEZE) {
        await this.freezeWallet(walletId);
      }

      // 7. Cria alerta de segurança
      await this.alertService.createAlert(
        'WALLET_RECOVERY_INITIATED',
        'HIGH',
        {
          walletId,
          userId,
          type,
          requestId: request.id
        }
      );

      return request;
    } catch (error) {
      this.logger.error('Error initiating wallet recovery', error as Error);
      throw error;
    }
  }

  private async getActiveRecoveryRequest(walletId: string): Promise<RecoveryRequest | null> {
    try {
      const requests = await this.cache.get<RecoveryRequest[]>(this.RECOVERY_CACHE_KEY) || [];
      return requests.find(req => 
        req.walletId === walletId && 
        [RecoveryStatus.PENDING, RecoveryStatus.AWAITING_APPROVALS, RecoveryStatus.IN_PROGRESS].includes(req.status)
      ) || null;
    } catch (error) {
      this.logger.error('Error getting active recovery request', error as Error);
      return null;
    }
  }

  private async saveRecoveryRequest(request: RecoveryRequest): Promise<void> {
    try {
      const requests = await this.cache.get<RecoveryRequest[]>(this.RECOVERY_CACHE_KEY) || [];
      const index = requests.findIndex(req => req.id === request.id);
      
      if (index >= 0) {
        requests[index] = request;
      } else {
        requests.push(request);
      }

      await this.cache.set(this.RECOVERY_CACHE_KEY, requests, this.RECOVERY_TTL);
    } catch (error) {
      this.logger.error('Error saving recovery request', error as Error);
      throw error;
    }
  }

  private async notifyGuardians(wallet: any, request: RecoveryRequest): Promise<void> {
    try {
      const guardians = await this.getWalletGuardians(wallet.id);
      
      for (const guardian of guardians) {
        const user = await this.userRepository.findOne(guardian.userId);
        if (user && user.whatsappOptIn) {
          const message = this.formatRecoveryNotification(request, wallet);
          await this.whatsappService.sendMessage(
            user.phone,
            message,
            WhatsAppPriority.CRITICAL
          );
        }
      }
    } catch (error) {
      this.logger.error('Error notifying guardians', error as Error);
    }
  }

  private formatRecoveryNotification(request: RecoveryRequest, wallet: any): string {
    const messages = {
      [RecoveryType.GUARDIAN_TRANSFER]: '🔄 Solicitação de transferência de carteira',
      [RecoveryType.SOCIAL_RECOVERY]: '🔐 Solicitação de recuperação social',
      [RecoveryType.EMERGENCY_FREEZE]: '❄️ Congelamento de emergência',
      [RecoveryType.MASTER_KEY_RECOVERY]: '🔑 Recuperação de chave mestra'
    };

    let message = `${messages[request.type]}\n\n`;
    message += `ID da Carteira: ${wallet.address}\n`;
    message += `ID da Solicitação: ${request.id}\n`;
    message += `Expira em: ${request.expiresAt.toLocaleString()}\n\n`;

    if (request.type === RecoveryType.GUARDIAN_TRANSFER && request.newAddress) {
      message += `Novo endereço: ${request.newAddress}\n\n`;
    }

    message += 'Para aprovar ou rejeitar esta solicitação, acesse o app ou responda a esta mensagem.';

    return message;
  }

  private async getWalletGuardians(walletId: string): Promise<any[]> {
    // TODO: Implementar busca de guardiões no contrato inteligente
    return [];
  }

  private async freezeWallet(walletId: string): Promise<void> {
    try {
      // 1. Desativa a carteira no banco de dados
      await this.walletRepository.update(walletId, { isActive: false });

      // 2. Adiciona à lista de carteiras congeladas
      await this.cache.set(
        `frozen_wallet_${walletId}`,
        {
          frozenAt: new Date(),
          unfreezesAt: new Date(Date.now() + this.EMERGENCY_FREEZE_DURATION * 1000)
        },
        this.EMERGENCY_FREEZE_DURATION
      );

      // 3. Cria alerta
      await this.alertService.createAlert(
        'WALLET_FROZEN',
        'HIGH',
        {
          walletId,
          duration: this.EMERGENCY_FREEZE_DURATION,
          reason: 'Emergency freeze requested'
        }
      );

      this.logger.info(`Wallet ${walletId} frozen for emergency recovery`);
    } catch (error) {
      this.logger.error('Error freezing wallet', error as Error);
      throw error;
    }
  }

  async approveRecovery(
    requestId: string,
    guardianAddress: string
  ): Promise<RecoveryRequest> {
    try {
      const request = await this.getRecoveryRequest(requestId);
      if (!request) {
        throw new Error('Recovery request not found');
      }

      // Valida status
      if (![RecoveryStatus.PENDING, RecoveryStatus.AWAITING_APPROVALS].includes(request.status)) {
        throw new Error('Recovery request cannot be approved in current status');
      }

      // Valida expiração
      if (new Date() > request.expiresAt) {
        request.status = RecoveryStatus.EXPIRED;
        await this.saveRecoveryRequest(request);
        throw new Error('Recovery request expired');
      }

      // Adiciona aprovação
      if (!request.guardianApprovals.includes(guardianAddress)) {
        request.guardianApprovals.push(guardianAddress);
      }

      // Atualiza status se atingiu threshold
      if (request.guardianApprovals.length >= this.APPROVAL_THRESHOLD) {
        request.status = RecoveryStatus.IN_PROGRESS;
        await this.executeRecovery(request);
      } else {
        request.status = RecoveryStatus.AWAITING_APPROVALS;
      }

      await this.saveRecoveryRequest(request);
      return request;

    } catch (error) {
      this.logger.error('Error approving recovery request', error as Error);
      throw error;
    }
  }

  private async getRecoveryRequest(requestId: string): Promise<RecoveryRequest | null> {
    try {
      const requests = await this.cache.get<RecoveryRequest[]>(this.RECOVERY_CACHE_KEY) || [];
      return requests.find(req => req.id === requestId) || null;
    } catch (error) {
      this.logger.error('Error getting recovery request', error as Error);
      return null;
    }
  }

  private async executeRecovery(request: RecoveryRequest): Promise<void> {
    try {
      const wallet = await this.walletRepository.findOne(request.walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      switch (request.type) {
        case RecoveryType.GUARDIAN_TRANSFER:
          await this.executeGuardianTransfer(request, wallet);
          break;

        case RecoveryType.SOCIAL_RECOVERY:
          await this.executeSocialRecovery(request, wallet);
          break;

        case RecoveryType.MASTER_KEY_RECOVERY:
          await this.executeMasterKeyRecovery(request, wallet);
          break;

        default:
          throw new Error(`Unsupported recovery type: ${request.type}`);
      }

      // Atualiza status da solicitação
      request.status = RecoveryStatus.COMPLETED;
      request.completedAt = new Date();
      await this.saveRecoveryRequest(request);

      // Notifica usuário
      const user = await this.userRepository.findOne(request.userId);
      if (user && user.whatsappOptIn) {
        await this.whatsappService.sendMessage(
          user.phone,
          `✅ Recuperação de carteira concluída com sucesso!\nID da Solicitação: ${request.id}`,
          WhatsAppPriority.HIGH
        );
      }

    } catch (error) {
      this.logger.error('Error executing recovery', error as Error);
      
      // Atualiza status para falha
      request.status = RecoveryStatus.FAILED;
      await this.saveRecoveryRequest(request);

      throw error;
    }
  }

  private async executeGuardianTransfer(request: RecoveryRequest, wallet: any): Promise<void> {
    if (!request.newAddress) {
      throw new Error('New address required for guardian transfer');
    }

    try {
      // 1. Valida novo endereço
      if (!ethers.isAddress(request.newAddress)) {
        throw new Error('Invalid new address');
      }

      // 2. Prepara transferência
      const provider = BlockchainProvider.getProvider(wallet.network);
      const balance = await provider.getBalance(wallet.address);

      // 3. Valida transação com serviço de segurança
      const validation = await this.securityService.validateMainnetTransaction(
        wallet.network,
        wallet.id,
        {
          to: request.newAddress,
          value: balance,
          from: wallet.address
        },
        TransactionType.TRANSFER
      );

      if (!validation.isValid) {
        throw new Error(`Transaction validation failed: ${validation.reason}`);
      }

      // 4. Executa transferência
      const privateKey = WalletEncryption.decryptPrivateKey(
        wallet.privateKeyEncrypted,
        process.env.MASTER_KEY!,
        this.logger
      );

      const walletInstance = new Wallet(privateKey, provider);
      const tx = await walletInstance.sendTransaction({
        to: request.newAddress,
        value: balance
      });

      // 5. Registra transação
      await this.transactionRepository.save({
        walletId: wallet.id,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.PENDING,
        fromAddress: wallet.address,
        toAddress: request.newAddress,
        tokenAddress: 'native',
        amount: balance.toString(),
        network: wallet.network,
        hash: tx.hash
      });

      // 6. Monitora transação
      await tx.wait(3); // Espera 3 confirmações

      // 7. Atualiza carteira
      await this.walletRepository.update(wallet.id, { isActive: false });

    } catch (error) {
      this.logger.error('Error executing guardian transfer', error as Error);
      throw error;
    }
  }

  private async executeSocialRecovery(request: RecoveryRequest, wallet: any): Promise<void> {
    try {
      // 1. Gera novo par de chaves
      const newWallet = Wallet.createRandom();

      // 2. Criptografa nova chave privada
      const newPrivateKeyEncrypted = WalletEncryption.encryptPrivateKey(
        newWallet.privateKey,
        process.env.MASTER_KEY!,
        this.logger
      );

      // 3. Atualiza carteira com nova chave
      await this.walletRepository.update(wallet.id, {
        privateKeyEncrypted: newPrivateKeyEncrypted
      });

      // 4. Registra evento de recuperação
      await this.alertService.createAlert(
        'WALLET_RECOVERED',
        'HIGH',
        {
          walletId: wallet.id,
          method: 'SOCIAL_RECOVERY',
          requestId: request.id
        }
      );

    } catch (error) {
      this.logger.error('Error executing social recovery', error as Error);
      throw error;
    }
  }

  private async executeMasterKeyRecovery(request: RecoveryRequest, wallet: any): Promise<void> {
    try {
      // 1. Valida master key atual
      if (!process.env.MASTER_KEY) {
        throw new Error('Master key not configured');
      }

      // 2. Gera nova master key
      const newMasterKey = ethers.randomBytes(32).toString('hex');

      // 3. Re-criptografa chave privada com nova master key
      const privateKey = WalletEncryption.decryptPrivateKey(
        wallet.privateKeyEncrypted,
        process.env.MASTER_KEY,
        this.logger
      );

      const newPrivateKeyEncrypted = WalletEncryption.encryptPrivateKey(
        privateKey,
        newMasterKey,
        this.logger
      );

      // 4. Atualiza carteira
      await this.walletRepository.update(wallet.id, {
        privateKeyEncrypted: newPrivateKeyEncrypted
      });

      // 5. Atualiza master key no ambiente
      // TODO: Implementar atualização segura da master key no ambiente

      // 6. Registra evento
      await this.alertService.createAlert(
        'MASTER_KEY_ROTATED',
        'CRITICAL',
        {
          walletId: wallet.id,
          requestId: request.id
        }
      );

    } catch (error) {
      this.logger.error('Error executing master key recovery', error as Error);
      throw error;
    }
  }

  async cancelRecovery(requestId: string, userId: string): Promise<void> {
    try {
      const request = await this.getRecoveryRequest(requestId);
      if (!request) {
        throw new Error('Recovery request not found');
      }

      // Valida permissão
      if (request.userId !== userId) {
        throw new Error('Not authorized to cancel this request');
      }

      // Valida status
      if (![RecoveryStatus.PENDING, RecoveryStatus.AWAITING_APPROVALS].includes(request.status)) {
        throw new Error('Recovery request cannot be cancelled in current status');
      }

      // Atualiza status
      request.status = RecoveryStatus.CANCELLED;
      await this.saveRecoveryRequest(request);

      // Notifica guardiões
      const wallet = await this.walletRepository.findOne(request.walletId);
      if (wallet) {
        await this.notifyGuardiansCancellation(wallet, request);
      }

      // Registra evento
      await this.alertService.createAlert(
        'RECOVERY_CANCELLED',
        'MEDIUM',
        {
          requestId,
          walletId: request.walletId,
          userId
        }
      );

    } catch (error) {
      this.logger.error('Error cancelling recovery request', error as Error);
      throw error;
    }
  }

  private async notifyGuardiansCancellation(wallet: any, request: RecoveryRequest): Promise<void> {
    try {
      const guardians = await this.getWalletGuardians(wallet.id);
      
      for (const guardian of guardians) {
        const user = await this.userRepository.findOne(guardian.userId);
        if (user && user.whatsappOptIn) {
          await this.whatsappService.sendMessage(
            user.phone,
            `❌ Solicitação de recuperação cancelada\nID da Solicitação: ${request.id}`,
            WhatsAppPriority.HIGH
          );
        }
      }
    } catch (error) {
      this.logger.error('Error notifying guardians about cancellation', error as Error);
    }
  }

  async getRecoveryStatus(requestId: string): Promise<RecoveryRequest | null> {
    return this.getRecoveryRequest(requestId);
  }

  async listActiveRecoveries(userId: string): Promise<RecoveryRequest[]> {
    try {
      const requests = await this.cache.get<RecoveryRequest[]>(this.RECOVERY_CACHE_KEY) || [];
      return requests.filter(req => 
        req.userId === userId && 
        [RecoveryStatus.PENDING, RecoveryStatus.AWAITING_APPROVALS, RecoveryStatus.IN_PROGRESS].includes(req.status)
      );
    } catch (error) {
      this.logger.error('Error listing active recoveries', error as Error);
      return [];
    }
  }
}
