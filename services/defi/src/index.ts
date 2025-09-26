import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { DataSource } from 'typeorm';
import { RedisCache } from '@common/infrastructure/cache/RedisCache';
import { SecurityMiddleware } from '@common/infrastructure/security/SecurityMiddleware';
import { HealthCheckMiddleware } from '@common/infrastructure/middleware/healthCheckMiddleware';
import { MetricsService } from '@common/infrastructure/monitoring/MetricsService';
import { WalletController } from './api/controllers/WalletController';
import { SmartWalletService } from './domain/SmartWalletService';
import { SwapService } from './domain/SwapService';
import { NotusWhatsAppService } from '@common/infrastructure/whatsapp/NotusWhatsAppService';
import { WalletRepository } from '@common/infrastructure/repositories/WalletRepository';
import { UserRepository } from '@common/infrastructure/repositories/UserRepository';
import { TransactionRepository } from '@common/infrastructure/repositories/TransactionRepository';
import { dataSourceOptions } from '@common/infrastructure/database/ormconfig';

class DeFiServiceApp {
  private readonly app: express.Application;
  private readonly port: number;
  private readonly dataSource: DataSource;
  private readonly securityConfig = {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      exposedHeaders: ['X-CSRF-Token'],
      credentials: true
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    },
    csrf: {
      enabled: true,
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
    }
  };

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3002');
    this.dataSource = new DataSource(dataSourceOptions);
    
    this.setupMiddleware();
    this.setupControllers();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Middlewares básicos
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors(this.securityConfig.cors));
    this.app.use(helmet());

    // Middleware de segurança
    const securityMiddleware = new SecurityMiddleware(
      null, // AuthService será injetado depois
      this.securityConfig
    );
    securityMiddleware.setupSecurity(this.app);

    // Health check
    const healthCheck = new HealthCheckMiddleware(this.dataSource);
    healthCheck.setupRoutes(this.app);
  }

  private setupControllers(): void {
    // Repositórios
    const walletRepository = new WalletRepository(this.dataSource);
    const userRepository = new UserRepository(this.dataSource);
    const transactionRepository = new TransactionRepository(this.dataSource);

    // Serviços
    const whatsappService = new NotusWhatsAppService();
    const metricsService = new MetricsService(whatsappService);
    
    const walletService = new SmartWalletService(
      walletRepository,
      userRepository,
      transactionRepository,
      whatsappService
    );

    const swapService = new SwapService(
      walletRepository,
      transactionRepository,
      userRepository,
      whatsappService
    );

    // Controllers
    const walletController = new WalletController(
      walletService,
      swapService
    );

    // Setup das rotas
    walletController.setupRoutes(this.app);
  }

  private setupErrorHandling(): void {
    // Handler de erros não tratados
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Handler de rotas não encontradas
    this.app.use((req: express.Request, res: express.Response) => {
      res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
      });
    });
  }

  async start(): Promise<void> {
    try {
      // Conectar ao banco de dados
      await this.dataSource.initialize();
      console.log('Database connection established');

      // Iniciar servidor
      this.app.listen(this.port, () => {
        console.log(`DeFi service running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start service:', error);
      process.exit(1);
    }
  }
}

// Iniciar aplicação
const service = new DeFiServiceApp();
service.start().catch(console.error);
