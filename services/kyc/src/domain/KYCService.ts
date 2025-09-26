import { User } from '@common/domain/entities/User';
import { IUserRepository } from '@common/domain/repositories/IUserRepository';
import { KYCLevel, KYCStatus } from '@common/types';
import { KYC_LEVELS } from '@common/constants/kyc';
import { WhatsAppSLAMonitor } from '@common/infrastructure/monitoring/WhatsAppSLAMonitor';
import { NotificationEscalator } from '@common/infrastructure/notifications/NotificationEscalator';

export interface KYCDocument {
  type: 'ID_FRONT' | 'ID_BACK' | 'SELFIE' | 'ADDRESS_PROOF';
  image: Buffer;
  metadata?: Record<string, any>;
}

export interface OCRResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    name?: string;
    documentNumber?: string;
    birthDate?: string;
    address?: string;
    face?: Buffer;
  };
}

export interface FaceMatchResult {
  isMatch: boolean;
  confidence: number;
}

export class KYCService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ocrService: any, // TODO: Implementar interface do serviço de OCR
    private readonly faceService: any // TODO: Implementar interface do serviço de biometria
  ) {}

  async startKYCProcess(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    await this.userRepository.updateKYCStatus(userId, 'IN_PROGRESS');

    // Enviar mensagem de boas-vindas via WhatsApp
    const notificationId = `kyc_welcome_${userId}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando mensagem de boas-vindas KYC para ${user.phone}`);
  }

  async processDocument(userId: string, document: KYCDocument): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // Processar documento com OCR
    const ocrResult = await this.processOCR(document);
    if (!ocrResult.isValid) {
      await this.notifyDocumentRejection(user, document.type, 'OCR validation failed');
      return false;
    }

    // Se for selfie, fazer match facial
    if (document.type === 'SELFIE' && ocrResult.extractedData.face) {
      const faceMatch = await this.faceService.verifyIdentity(
        document.image,
        ocrResult.extractedData.face
      );

      if (!faceMatch.isMatch || faceMatch.confidence < 0.95) {
        await this.notifyDocumentRejection(user, document.type, 'Face match failed');
        return false;
      }
    }

    // Atualizar nível de KYC com base nos documentos aprovados
    await this.updateKYCLevel(user);

    return true;
  }

  private async processOCR(document: KYCDocument): Promise<OCRResult> {
    // TODO: Implementar integração real com serviço de OCR
    return {
      isValid: true,
      confidence: 0.98,
      extractedData: {
        name: 'John Doe',
        documentNumber: '123456789',
        birthDate: '1990-01-01',
        address: '123 Main St'
      }
    };
  }

  private async updateKYCLevel(user: User): Promise<void> {
    // Lógica simplificada - em produção seria mais complexa
    let newLevel: KYCLevel = 'LEVEL_0';

    if (user.kycStatus === 'APPROVED') {
      switch (user.kycLevel) {
        case 'LEVEL_0':
          newLevel = 'LEVEL_1';
          break;
        case 'LEVEL_1':
          newLevel = 'LEVEL_2';
          break;
        case 'LEVEL_2':
          newLevel = 'LEVEL_3';
          break;
      }

      await this.userRepository.updateKYCLevel(user.id, newLevel);
      await this.notifyKYCLevelUpdate(user, newLevel);
    }
  }

  private async notifyDocumentRejection(
    user: User,
    documentType: string,
    reason: string
  ): Promise<void> {
    const notificationId = `kyc_rejection_${user.id}_${documentType}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    const message = `Documento ${documentType} foi rejeitado. Motivo: ${reason}`;
    
    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando notificação para ${user.phone}: ${message}`);

    // Configurar escalonamento se necessário
    await NotificationEscalator.handleNotificationTimeout(
      notificationId,
      {
        userId: user.id,
        phone: user.phone,
        email: user.email
      },
      'HIGH',
      message
    );
  }

  private async notifyKYCLevelUpdate(user: User, newLevel: KYCLevel): Promise<void> {
    const notificationId = `kyc_level_update_${user.id}`;
    await WhatsAppSLAMonitor.trackNotificationSent(notificationId, 'HIGH');

    const limits = KYC_LEVELS[newLevel];
    const message = `Parabéns! Seu nível KYC foi atualizado para ${newLevel}. ` +
      `Novos limites: ${limits.dailyLimit} por dia, ${limits.monthlyLimit} por mês.`;

    // TODO: Implementar envio real via Notus API
    console.log(`[WhatsApp] Enviando notificação para ${user.phone}: ${message}`);
  }

  async getKYCStatus(userId: string): Promise<{
    status: KYCStatus;
    level: KYCLevel;
    limits: {
      daily: string;
      monthly: string;
      singleTransaction: string;
    };
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const limits = KYC_LEVELS[user.kycLevel];

    return {
      status: user.kycStatus,
      level: user.kycLevel,
      limits: {
        daily: limits.dailyLimit.toString(),
        monthly: limits.monthlyLimit.toString(),
        singleTransaction: limits.singleTransactionLimit.toString()
      }
    };
  }
}
