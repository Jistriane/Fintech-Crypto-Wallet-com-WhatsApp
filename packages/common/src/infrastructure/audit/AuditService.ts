import { ILogger } from '../../domain/interfaces/ILogger';
import { Network, TransactionType, TransactionStatus, KYCLevel } from '../../types/enums';
import { RedisCache } from '../cache/RedisCache';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IWalletRepository } from '../../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { AlertService } from '../security/AlertService';
import { ethers } from 'ethers';

interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: AuditSeverity;
  timestamp: Date;
  userId?: string;
  walletId?: string;
  transactionId?: string;
  network?: Network;
  data: any;
  metadata: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    location?: string;
  };
}

enum AuditEventType {
  // Autenticação
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // KYC
  KYC_UPDATED = 'KYC_UPDATED',
  KYC_DOCUMENT_UPLOADED = 'KYC_DOCUMENT_UPLOADED',
  KYC_VERIFICATION_FAILED = 'KYC_VERIFICATION_FAILED',

  // Carteira
  WALLET_CREATED = 'WALLET_CREATED',
  WALLET_IMPORTED = 'WALLET_IMPORTED',
  WALLET_EXPORTED = 'WALLET_EXPORTED',
  WALLET_BACKUP_CREATED = 'WALLET_BACKUP_CREATED',
  WALLET_RESTORED = 'WALLET_RESTORED',
  WALLET_FROZEN = 'WALLET_FROZEN',
  WALLET_UNFROZEN = 'WALLET_UNFROZEN',

  // Transações
  TRANSACTION_INITIATED = 'TRANSACTION_INITIATED',
  TRANSACTION_SIGNED = 'TRANSACTION_SIGNED',
  TRANSACTION_BROADCAST = 'TRANSACTION_BROADCAST',
  TRANSACTION_CONFIRMED = 'TRANSACTION_CONFIRMED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_CANCELLED = 'TRANSACTION_CANCELLED',

  // Guardiões
  GUARDIAN_ADDED = 'GUARDIAN_ADDED',
  GUARDIAN_REMOVED = 'GUARDIAN_REMOVED',
  GUARDIAN_APPROVED = 'GUARDIAN_APPROVED',
  GUARDIAN_REJECTED = 'GUARDIAN_REJECTED',

  // Limites
  LIMIT_UPDATED = 'LIMIT_UPDATED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  LIMIT_RESET = 'LIMIT_RESET',

  // Segurança
  SECURITY_ALERT = 'SECURITY_ALERT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  IP_BLOCKED = 'IP_BLOCKED',
  DEVICE_BLOCKED = 'DEVICE_BLOCKED',

  // Sistema
  CONFIG_UPDATED = 'CONFIG_UPDATED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_STOPPED = 'SERVICE_STOPPED',
  ERROR_OCCURRED = 'ERROR_OCCURRED'
}

enum AuditSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class AuditService {
  private readonly AUDIT_CACHE_KEY = 'audit_events';
  private readonly AUDIT_TTL = 86400 * 30; // 30 dias
  private readonly MAX_CACHED_EVENTS = 10000;
  private readonly BATCH_SIZE = 100;
  private eventQueue: AuditEvent[] = [];
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly walletRepository: IWalletRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly alertService: AlertService,
    private readonly cache: RedisCache,
    private readonly logger: ILogger
  ) {}

  async start(): Promise<void> {
    if (this.processingInterval) {
      return;
    }

    this.processingInterval = setInterval(
      () => this.processEventQueue(),
      5000 // Processa a cada 5 segundos
    );

    await this.createAuditEvent({
      type: AuditEventType.SERVICE_STARTED,
      severity: AuditSeverity.INFO,
      data: {
        service: 'AuditService',
        version: '1.0.0'
      }
    });

    this.logger.info('Audit service started');
  }

  async stop(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Processa eventos restantes
    await this.processEventQueue();

    await this.createAuditEvent({
      type: AuditEventType.SERVICE_STOPPED,
      severity: AuditSeverity.INFO,
      data: {
        service: 'AuditService',
        reason: 'Normal shutdown'
      }
    });

    this.logger.info('Audit service stopped');
  }

  async createAuditEvent(
    params: {
      type: AuditEventType;
      severity: AuditSeverity;
      userId?: string;
      walletId?: string;
      transactionId?: string;
      network?: Network;
      data: any;
      metadata?: {
        ip?: string;
        userAgent?: string;
        deviceId?: string;
        location?: string;
      };
    }
  ): Promise<void> {
    try {
      const event: AuditEvent = {
        id: ethers.randomBytes(16).toString('hex'),
        timestamp: new Date(),
        ...params,
        metadata: params.metadata || {}
      };

      // Adiciona à fila de eventos
      this.eventQueue.push(event);

      // Se a fila está muito grande, processa imediatamente
      if (this.eventQueue.length >= this.BATCH_SIZE) {
        await this.processEventQueue();
      }

      // Para eventos críticos, notifica imediatamente
      if (params.severity === AuditSeverity.CRITICAL) {
        await this.notifyCriticalEvent(event);
      }

    } catch (error) {
      this.logger.error('Error creating audit event', error as Error);
      throw error;
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Pega eventos para processar
      const eventsToProcess = this.eventQueue.splice(0, this.BATCH_SIZE);

      // Salva eventos no cache
      await this.saveEvents(eventsToProcess);

      // Analisa eventos em busca de padrões suspeitos
      await this.analyzeEvents(eventsToProcess);

      // Limpa eventos antigos se necessário
      await this.cleanOldEvents();

    } catch (error) {
      this.logger.error('Error processing audit events', error as Error);
      
      // Retorna eventos não processados para a fila
      this.eventQueue.unshift(...this.eventQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  private async saveEvents(events: AuditEvent[]): Promise<void> {
    try {
      const cachedEvents = await this.cache.get<AuditEvent[]>(this.AUDIT_CACHE_KEY) || [];
      
      // Adiciona novos eventos
      cachedEvents.push(...events);

      // Remove eventos mais antigos se exceder o limite
      if (cachedEvents.length > this.MAX_CACHED_EVENTS) {
        cachedEvents.splice(0, cachedEvents.length - this.MAX_CACHED_EVENTS);
      }

      await this.cache.set(this.AUDIT_CACHE_KEY, cachedEvents, this.AUDIT_TTL);
    } catch (error) {
      this.logger.error('Error saving audit events', error as Error);
      throw error;
    }
  }

  private async analyzeEvents(events: AuditEvent[]): Promise<void> {
    try {
      // 1. Agrupa eventos por usuário
      const userEvents = this.groupEventsByUser(events);

      // 2. Analisa padrões por usuário
      for (const [userId, userEvts] of userEvents.entries()) {
        await this.analyzeUserEvents(userId, userEvts);
      }

      // 3. Analisa padrões globais
      await this.analyzeGlobalPatterns(events);

    } catch (error) {
      this.logger.error('Error analyzing audit events', error as Error);
    }
  }

  private groupEventsByUser(events: AuditEvent[]): Map<string, AuditEvent[]> {
    const userEvents = new Map<string, AuditEvent[]>();
    
    for (const event of events) {
      if (event.userId) {
        const userEvts = userEvents.get(event.userId) || [];
        userEvts.push(event);
        userEvents.set(event.userId, userEvts);
      }
    }

    return userEvents;
  }

  private async analyzeUserEvents(userId: string, events: AuditEvent[]): Promise<void> {
    try {
      // 1. Verifica falhas de login consecutivas
      const loginFailures = events.filter(e => 
        e.type === AuditEventType.LOGIN_FAILED &&
        e.timestamp.getTime() > Date.now() - 3600000 // última hora
      );

      if (loginFailures.length >= 5) {
        await this.alertService.createAlert(
          'MULTIPLE_LOGIN_FAILURES',
          'HIGH',
          {
            userId,
            count: loginFailures.length,
            attempts: loginFailures.map(e => ({
              timestamp: e.timestamp,
              ip: e.metadata.ip
            }))
          }
        );
      }

      // 2. Verifica acessos de IPs diferentes
      const uniqueIPs = new Set(events
        .filter(e => e.type === AuditEventType.USER_LOGIN)
        .map(e => e.metadata.ip)
      );

      if (uniqueIPs.size > 3) {
        await this.alertService.createAlert(
          'MULTIPLE_IP_ACCESS',
          'MEDIUM',
          {
            userId,
            ips: Array.from(uniqueIPs)
          }
        );
      }

      // 3. Verifica transações de alto valor
      const highValueTxs = events.filter(e =>
        e.type === AuditEventType.TRANSACTION_INITIATED &&
        e.data.value && BigInt(e.data.value) > ethers.parseEther('1000')
      );

      if (highValueTxs.length > 0) {
        await this.alertService.createAlert(
          'HIGH_VALUE_TRANSACTIONS',
          'HIGH',
          {
            userId,
            transactions: highValueTxs.map(e => ({
              id: e.transactionId,
              value: e.data.value,
              timestamp: e.timestamp
            }))
          }
        );
      }

      // 4. Verifica alterações de configuração de segurança
      const securityChanges = events.filter(e =>
        [
          AuditEventType.PASSWORD_CHANGED,
          AuditEventType.MFA_DISABLED,
          AuditEventType.GUARDIAN_REMOVED,
          AuditEventType.LIMIT_UPDATED
        ].includes(e.type)
      );

      if (securityChanges.length > 0) {
        await this.alertService.createAlert(
          'SECURITY_SETTINGS_CHANGED',
          'MEDIUM',
          {
            userId,
            changes: securityChanges.map(e => ({
              type: e.type,
              timestamp: e.timestamp,
              data: e.data
            }))
          }
        );
      }

    } catch (error) {
      this.logger.error(`Error analyzing events for user ${userId}`, error as Error);
    }
  }

  private async analyzeGlobalPatterns(events: AuditEvent[]): Promise<void> {
    try {
      // 1. Verifica volume anormal de transações
      const txEvents = events.filter(e => 
        e.type === AuditEventType.TRANSACTION_INITIATED
      );

      if (txEvents.length > 1000) { // Mais de 1000 transações no batch
        await this.alertService.createAlert(
          'HIGH_TRANSACTION_VOLUME',
          'HIGH',
          {
            count: txEvents.length,
            timeframe: 'batch',
            timestamp: new Date()
          }
        );
      }

      // 2. Verifica erros sistêmicos
      const errorEvents = events.filter(e => 
        e.type === AuditEventType.ERROR_OCCURRED
      );

      if (errorEvents.length > 100) { // Mais de 100 erros no batch
        await this.alertService.createAlert(
          'HIGH_ERROR_RATE',
          'HIGH',
          {
            count: errorEvents.length,
            timeframe: 'batch',
            errors: errorEvents.map(e => ({
              timestamp: e.timestamp,
              error: e.data.error
            }))
          }
        );
      }

      // 3. Verifica padrões de IP suspeitos
      const ipCounts = new Map<string, number>();
      events.forEach(e => {
        if (e.metadata.ip) {
          ipCounts.set(e.metadata.ip, (ipCounts.get(e.metadata.ip) || 0) + 1);
        }
      });

      for (const [ip, count] of ipCounts.entries()) {
        if (count > 1000) { // Mais de 1000 eventos do mesmo IP
          await this.alertService.createAlert(
            'SUSPICIOUS_IP_ACTIVITY',
            'HIGH',
            {
              ip,
              count,
              timeframe: 'batch'
            }
          );
        }
      }

    } catch (error) {
      this.logger.error('Error analyzing global patterns', error as Error);
    }
  }

  private async notifyCriticalEvent(event: AuditEvent): Promise<void> {
    try {
      // 1. Cria alerta
      await this.alertService.createAlert(
        'CRITICAL_AUDIT_EVENT',
        'CRITICAL',
        {
          eventId: event.id,
          type: event.type,
          timestamp: event.timestamp,
          data: event.data
        }
      );

      // 2. Notifica administradores
      // TODO: Implementar notificação de administradores

      // 3. Log especial
      this.logger.error('Critical audit event detected', {
        eventId: event.id,
        type: event.type,
        data: event.data
      });

    } catch (error) {
      this.logger.error('Error notifying critical event', error as Error);
    }
  }

  private async cleanOldEvents(): Promise<void> {
    try {
      const events = await this.cache.get<AuditEvent[]>(this.AUDIT_CACHE_KEY) || [];
      
      // Remove eventos mais antigos que 30 dias
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const filteredEvents = events.filter(e => e.timestamp >= cutoffDate);
      
      if (filteredEvents.length < events.length) {
        await this.cache.set(this.AUDIT_CACHE_KEY, filteredEvents, this.AUDIT_TTL);
      }
    } catch (error) {
      this.logger.error('Error cleaning old events', error as Error);
    }
  }

  async getEvents(
    filter?: {
      userId?: string;
      walletId?: string;
      type?: AuditEventType;
      severity?: AuditSeverity;
      fromDate?: Date;
      toDate?: Date;
      network?: Network;
    },
    pagination?: {
      page: number;
      limit: number;
    }
  ): Promise<{
    events: AuditEvent[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      let events = await this.cache.get<AuditEvent[]>(this.AUDIT_CACHE_KEY) || [];

      // Aplica filtros
      if (filter) {
        events = events.filter(e => {
          if (filter.userId && e.userId !== filter.userId) return false;
          if (filter.walletId && e.walletId !== filter.walletId) return false;
          if (filter.type && e.type !== filter.type) return false;
          if (filter.severity && e.severity !== filter.severity) return false;
          if (filter.network && e.network !== filter.network) return false;
          if (filter.fromDate && e.timestamp < filter.fromDate) return false;
          if (filter.toDate && e.timestamp > filter.toDate) return false;
          return true;
        });
      }

      // Ordena por timestamp decrescente
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Aplica paginação
      const total = events.length;
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 50;
      const pages = Math.ceil(total / limit);

      const start = (page - 1) * limit;
      const end = start + limit;
      events = events.slice(start, end);

      return {
        events,
        total,
        page,
        pages
      };

    } catch (error) {
      this.logger.error('Error getting audit events', error as Error);
      return {
        events: [],
        total: 0,
        page: 1,
        pages: 0
      };
    }
  }

  async getEventById(eventId: string): Promise<AuditEvent | null> {
    try {
      const events = await this.cache.get<AuditEvent[]>(this.AUDIT_CACHE_KEY) || [];
      return events.find(e => e.id === eventId) || null;
    } catch (error) {
      this.logger.error('Error getting audit event by ID', error as Error);
      return null;
    }
  }

  async getUserActivity(
    userId: string,
    period: '24h' | '7d' | '30d' = '24h'
  ): Promise<{
    loginCount: number;
    transactionCount: number;
    errorCount: number;
    securityEvents: number;
    lastLogin?: Date;
    lastTransaction?: Date;
    devices: string[];
    ips: string[];
  }> {
    try {
      const events = await this.cache.get<AuditEvent[]>(this.AUDIT_CACHE_KEY) || [];
      const now = new Date();
      const periodMs = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }[period];

      const userEvents = events.filter(e => 
        e.userId === userId &&
        now.getTime() - e.timestamp.getTime() <= periodMs
      );

      const loginEvents = userEvents.filter(e => e.type === AuditEventType.USER_LOGIN);
      const txEvents = userEvents.filter(e => e.type === AuditEventType.TRANSACTION_INITIATED);
      const errorEvents = userEvents.filter(e => e.type === AuditEventType.ERROR_OCCURRED);
      const securityEvents = userEvents.filter(e => 
        [
          AuditEventType.PASSWORD_CHANGED,
          AuditEventType.MFA_ENABLED,
          AuditEventType.MFA_DISABLED,
          AuditEventType.GUARDIAN_ADDED,
          AuditEventType.GUARDIAN_REMOVED,
          AuditEventType.LIMIT_UPDATED
        ].includes(e.type)
      );

      const devices = new Set(userEvents
        .filter(e => e.metadata.deviceId)
        .map(e => e.metadata.deviceId!)
      );

      const ips = new Set(userEvents
        .filter(e => e.metadata.ip)
        .map(e => e.metadata.ip!)
      );

      return {
        loginCount: loginEvents.length,
        transactionCount: txEvents.length,
        errorCount: errorEvents.length,
        securityEvents: securityEvents.length,
        lastLogin: loginEvents[0]?.timestamp,
        lastTransaction: txEvents[0]?.timestamp,
        devices: Array.from(devices),
        ips: Array.from(ips)
      };

    } catch (error) {
      this.logger.error('Error getting user activity', error as Error);
      return {
        loginCount: 0,
        transactionCount: 0,
        errorCount: 0,
        securityEvents: 0,
        devices: [],
        ips: []
      };
    }
  }
}
