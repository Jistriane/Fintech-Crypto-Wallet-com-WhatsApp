import { ILogger } from '../../domain/interfaces/ILogger';
import { Network, TransactionType, WhatsAppPriority } from '../../types/enums';
import { RedisCache } from '../cache/RedisCache';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ethers } from 'ethers';

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  network?: Network;
  walletId?: string;
  userId?: string;
  data: any;
  timestamp: Date;
  status: AlertStatus;
  notificationSent: boolean;
}

enum AlertType {
  SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION',
  LARGE_TRANSACTION = 'LARGE_TRANSACTION',
  UNUSUAL_PATTERN = 'UNUSUAL_PATTERN',
  NETWORK_CONGESTION = 'NETWORK_CONGESTION',
  HIGH_GAS_PRICE = 'HIGH_GAS_PRICE',
  SECURITY_BREACH = 'SECURITY_BREACH',
  GUARDIAN_REQUIRED = 'GUARDIAN_REQUIRED',
  BLACKLISTED_ADDRESS = 'BLACKLISTED_ADDRESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

enum AlertStatus {
  NEW = 'NEW',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export class AlertService {
  private readonly ALERT_CACHE_KEY = 'security_alerts';
  private readonly ALERT_TTL = 86400; // 24 horas
  private readonly MAX_ALERTS = 1000;
  private readonly severityToWhatsAppPriority: Map<AlertSeverity, WhatsAppPriority>;

  constructor(
    private readonly cache: RedisCache,
    private readonly logger: ILogger,
    private readonly whatsappService: NotusWhatsAppService,
    private readonly userRepository: IUserRepository,
    private readonly walletRepository: IWalletRepository
  ) {
    this.severityToWhatsAppPriority = new Map([
      [AlertSeverity.LOW, WhatsAppPriority.LOW],
      [AlertSeverity.MEDIUM, WhatsAppPriority.MEDIUM],
      [AlertSeverity.HIGH, WhatsAppPriority.HIGH],
      [AlertSeverity.CRITICAL, WhatsAppPriority.CRITICAL]
    ]);
  }

  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    data: any,
    network?: Network,
    walletId?: string,
    userId?: string
  ): Promise<Alert> {
    try {
      const alert: Alert = {
        id: ethers.randomBytes(16).toString('hex'),
        type,
        severity,
        network,
        walletId,
        userId,
        data,
        timestamp: new Date(),
        status: AlertStatus.NEW,
        notificationSent: false
      };

      // Salva o alerta
      await this.saveAlert(alert);

      // Processa o alerta
      await this.processAlert(alert);

      return alert;
    } catch (error) {
      this.logger.error('Error creating alert', error as Error);
      throw error;
    }
  }

  private async saveAlert(alert: Alert): Promise<void> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      
      // Remove alertas antigos se exceder o limite
      if (alerts.length >= this.MAX_ALERTS) {
        alerts.shift();
      }

      alerts.push(alert);
      await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);

      // Log do alerta
      this.logger.warn(`Security Alert: ${alert.type} (${alert.severity})`, {
        alertId: alert.id,
        network: alert.network,
        walletId: alert.walletId,
        userId: alert.userId,
        data: alert.data
      });
    } catch (error) {
      this.logger.error('Error saving alert', error as Error);
      throw error;
    }
  }

  private async processAlert(alert: Alert): Promise<void> {
    try {
      // 1. Notificação via WhatsApp
      await this.sendWhatsAppNotification(alert);

      // 2. Ações automáticas baseadas no tipo e severidade
      await this.executeAutomatedActions(alert);

      // 3. Atualiza o status do alerta
      await this.updateAlertStatus(alert.id, AlertStatus.INVESTIGATING);
    } catch (error) {
      this.logger.error('Error processing alert', error as Error);
      throw error;
    }
  }

  private async sendWhatsAppNotification(alert: Alert): Promise<void> {
    try {
      if (alert.userId) {
        const user = await this.userRepository.findOne(alert.userId);
        if (user && user.whatsappOptIn) {
          const message = this.formatAlertMessage(alert);
          const priority = this.severityToWhatsAppPriority.get(alert.severity) || WhatsAppPriority.MEDIUM;

          await this.whatsappService.sendMessage(
            user.phone,
            message,
            priority
          );

          // Atualiza o status de notificação
          await this.updateAlertNotificationStatus(alert.id, true);
        }
      }
    } catch (error) {
      this.logger.error('Error sending WhatsApp notification', error as Error);
    }
  }

  private formatAlertMessage(alert: Alert): string {
    const messages = {
      [AlertType.SUSPICIOUS_TRANSACTION]: '🚨 Transação suspeita detectada',
      [AlertType.LARGE_TRANSACTION]: '💰 Transação de alto valor detectada',
      [AlertType.UNUSUAL_PATTERN]: '⚠️ Padrão incomum de atividade detectado',
      [AlertType.NETWORK_CONGESTION]: '🌐 Congestionamento na rede detectado',
      [AlertType.HIGH_GAS_PRICE]: '⛽ Preço do gás muito alto',
      [AlertType.SECURITY_BREACH]: '🔓 Possível violação de segurança detectada',
      [AlertType.GUARDIAN_REQUIRED]: '🛡️ Aprovação de guardião necessária',
      [AlertType.BLACKLISTED_ADDRESS]: '⛔ Tentativa de interação com endereço na blacklist',
      [AlertType.RATE_LIMIT_EXCEEDED]: '⚡ Limite de taxa excedido',
      [AlertType.SYSTEM_ERROR]: '❌ Erro no sistema detectado'
    };

    let message = `${messages[alert.type] || 'Alerta de Segurança'}\n\n`;
    message += `Severidade: ${this.formatSeverity(alert.severity)}\n`;
    
    if (alert.network) {
      message += `Rede: ${alert.network}\n`;
    }

    message += `\nDetalhes:\n`;
    message += this.formatAlertData(alert.data);

    message += `\nID do Alerta: ${alert.id}\n`;
    message += `\nPara mais informações, acesse o app ou entre em contato com o suporte.`;

    return message;
  }

  private formatSeverity(severity: AlertSeverity): string {
    const severityEmojis = {
      [AlertSeverity.LOW]: '🟢',
      [AlertSeverity.MEDIUM]: '🟡',
      [AlertSeverity.HIGH]: '🟠',
      [AlertSeverity.CRITICAL]: '🔴'
    };
    return `${severityEmojis[severity]} ${severity}`;
  }

  private formatAlertData(data: any): string {
    let message = '';
    
    if (typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        if (key === 'value' && typeof value === 'string') {
          // Formata valores em wei para ether
          message += `${key}: ${ethers.formatEther(value)} ETH\n`;
        } else {
          message += `${key}: ${value}\n`;
        }
      }
    } else {
      message = String(data);
    }

    return message;
  }

  private async executeAutomatedActions(alert: Alert): Promise<void> {
    try {
      switch (alert.type) {
        case AlertType.SECURITY_BREACH:
          if (alert.severity === AlertSeverity.CRITICAL) {
            // Pausa operações da carteira
            if (alert.walletId) {
              await this.walletRepository.update(alert.walletId, { isActive: false });
              this.logger.info(`Wallet ${alert.walletId} paused due to security breach`);
            }
          }
          break;

        case AlertType.BLACKLISTED_ADDRESS:
          // Adiciona à lista de bloqueio local
          if (alert.data.address) {
            await this.cache.set(
              `blacklist_${alert.data.address.toLowerCase()}`,
              true,
              this.ALERT_TTL
            );
          }
          break;

        case AlertType.RATE_LIMIT_EXCEEDED:
          // Implementa backoff exponencial
          if (alert.userId) {
            const backoffKey = `rate_limit_backoff_${alert.userId}`;
            const currentBackoff = await this.cache.get<number>(backoffKey) || 1;
            await this.cache.set(backoffKey, currentBackoff * 2, currentBackoff * 60);
          }
          break;

        case AlertType.HIGH_GAS_PRICE:
          // Ajusta limites de gás automaticamente
          if (alert.network) {
            const gasPrice = BigInt(alert.data.gasPrice);
            const newLimit = gasPrice * BigInt(12) / BigInt(10); // 120% do preço atual
            // TODO: Atualizar limites de gás na configuração da rede
          }
          break;
      }
    } catch (error) {
      this.logger.error('Error executing automated actions', error as Error);
    }
  }

  private async updateAlertStatus(alertId: string, status: AlertStatus): Promise<void> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.status = status;
        await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);
      }
    } catch (error) {
      this.logger.error('Error updating alert status', error as Error);
    }
  }

  private async updateAlertNotificationStatus(alertId: string, sent: boolean): Promise<void> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.notificationSent = sent;
        await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);
      }
    } catch (error) {
      this.logger.error('Error updating alert notification status', error as Error);
    }
  }

  async getAlerts(
    filter?: {
      type?: AlertType;
      severity?: AlertSeverity;
      status?: AlertStatus;
      network?: Network;
      walletId?: string;
      userId?: string;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<Alert[]> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      
      return alerts.filter(alert => {
        if (filter?.type && alert.type !== filter.type) return false;
        if (filter?.severity && alert.severity !== filter.severity) return false;
        if (filter?.status && alert.status !== filter.status) return false;
        if (filter?.network && alert.network !== filter.network) return false;
        if (filter?.walletId && alert.walletId !== filter.walletId) return false;
        if (filter?.userId && alert.userId !== filter.userId) return false;
        if (filter?.fromDate && alert.timestamp < filter.fromDate) return false;
        if (filter?.toDate && alert.timestamp > filter.toDate) return false;
        return true;
      });
    } catch (error) {
      this.logger.error('Error getting alerts', error as Error);
      return [];
    }
  }

  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.status = AlertStatus.RESOLVED;
        alert.data.resolution = resolution;
        await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);

        this.logger.info(`Alert ${alertId} resolved`, { resolution });
      }
    } catch (error) {
      this.logger.error('Error resolving alert', error as Error);
      throw error;
    }
  }

  async markAsFalsePositive(alertId: string, reason: string): Promise<void> {
    try {
      const alerts = await this.cache.get<Alert[]>(this.ALERT_CACHE_KEY) || [];
      const alert = alerts.find(a => a.id === alertId);
      
      if (alert) {
        alert.status = AlertStatus.FALSE_POSITIVE;
        alert.data.falsePositiveReason = reason;
        await this.cache.set(this.ALERT_CACHE_KEY, alerts, this.ALERT_TTL);

        this.logger.info(`Alert ${alertId} marked as false positive`, { reason });
      }
    } catch (error) {
      this.logger.error('Error marking alert as false positive', error as Error);
      throw error;
    }
  }
}
