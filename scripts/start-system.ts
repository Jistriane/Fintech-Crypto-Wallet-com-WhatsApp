import { ethers } from 'ethers';
import { createConnection } from 'typeorm';
import Redis from 'ioredis';
import { MainnetMonitor } from '../packages/common/src/infrastructure/blockchain/monitoring/MainnetMonitor';
import { MainnetSecurityService } from '../packages/common/src/infrastructure/security/MainnetSecurityService';
import { AlertService } from '../packages/common/src/infrastructure/security/AlertService';
import { WalletRecoveryService } from '../packages/common/src/infrastructure/security/WalletRecoveryService';
import { BackupService } from '../packages/common/src/infrastructure/backup/BackupService';
import { AuditService } from '../packages/common/src/infrastructure/audit/AuditService';
import { GasService } from '../packages/common/src/infrastructure/blockchain/gas/GasService';
import { BlockchainProvider } from '../packages/common/src/infrastructure/blockchain/providers/BlockchainProvider';
import { RedisCache } from '../packages/common/src/infrastructure/cache/RedisCache';
import { Logger } from '../packages/common/src/infrastructure/logging/Logger';
import { NotusWhatsAppService } from '../packages/common/src/infrastructure/whatsapp/NotusWhatsAppService';
import { UserRepository } from '../packages/common/src/infrastructure/repositories/UserRepository';
import { WalletRepository } from '../packages/common/src/infrastructure/repositories/WalletRepository';
import { TransactionRepository } from '../packages/common/src/infrastructure/repositories/TransactionRepository';
import { AlertType, AlertSeverity } from '../packages/common/src/types/enums';
import ormconfig from '../ormconfig';

async function main() {
  const logger = new Logger();
  logger.info('Iniciando sistema...');

  try {
    // 1. Conecta ao banco de dados
    logger.info('Conectando ao banco de dados...');
    const connection = await createConnection(ormconfig);
    logger.info('Conexão com banco de dados estabelecida');

    // 2. Inicializa Redis
    logger.info('Inicializando Redis...');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    });
    const cache = new RedisCache(logger);
    logger.info('Redis inicializado');

    // 3. Inicializa provedores blockchain
    logger.info('Inicializando provedores blockchain...');
    const polygonProvider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const bscProvider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
    const ethereumProvider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    logger.info('Provedores blockchain inicializados');

    // 4. Inicializa repositórios
    logger.info('Inicializando repositórios...');
    const userRepository = new UserRepository(connection.getRepository('User'), logger);
    const walletRepository = new WalletRepository(connection.getRepository('Wallet'), logger);
    const transactionRepository = new TransactionRepository(connection.getRepository('Transaction'), logger);
    logger.info('Repositórios inicializados');

    // 5. Inicializa serviços
    logger.info('Inicializando serviços...');

    // Serviço de WhatsApp
    const whatsappService = new NotusWhatsAppService(
      process.env.NOTUS_API_KEY!,
      process.env.NOTUS_WEBHOOK_URL!,
      logger
    );

    // Serviço de monitoramento
    const mainnetMonitor = new MainnetMonitor(
      transactionRepository,
      walletRepository,
      cache,
      logger
    );

    // Serviço de segurança
    const securityService = new MainnetSecurityService(
      transactionRepository,
      walletRepository,
      mainnetMonitor,
      cache,
      logger
    );

    // Serviço de alertas
    const alertService = new AlertService(
      cache,
      logger,
      whatsappService,
      userRepository,
      walletRepository
    );

    // Serviço de recuperação
    const recoveryService = new WalletRecoveryService(
      userRepository,
      walletRepository,
      transactionRepository,
      whatsappService,
      alertService,
      securityService,
      cache,
      logger
    );

    // Serviço de backup
    const backupService = new BackupService(
      userRepository,
      walletRepository,
      transactionRepository,
      alertService,
      cache,
      logger,
      process.env.BACKUP_PATH
    );

    // Serviço de auditoria
    const auditService = new AuditService(
      userRepository,
      walletRepository,
      transactionRepository,
      alertService,
      cache,
      logger
    );

    // Serviço de gás
    const gasService = new GasService(
      mainnetMonitor,
      alertService,
      cache,
      logger
    );

    logger.info('Serviços inicializados');

    // 6. Inicia monitoramento
    logger.info('Iniciando monitoramento...');
    await mainnetMonitor.start();
    await backupService.start();
    await auditService.start();
    logger.info('Monitoramento iniciado');

    // 7. Verifica status inicial
    logger.info('Verificando status do sistema...');

    // Verifica conexão com blockchain
    const polygonBlock = await polygonProvider.getBlockNumber();
    const bscBlock = await bscProvider.getBlockNumber();
    const ethereumBlock = await ethereumProvider.getBlockNumber();
    logger.info('Status blockchain:', {
      polygon: { block: polygonBlock },
      bsc: { block: bscBlock },
      ethereum: { block: ethereumBlock }
    });

    // Verifica conexão com banco
    const dbStatus = connection.isConnected;
    logger.info('Status banco de dados:', { connected: dbStatus });

    // Verifica conexão com Redis
    const redisStatus = await redis.ping();
    logger.info('Status Redis:', { ping: redisStatus });

    // Verifica conexão com WhatsApp
    const whatsappStatus = await whatsappService.ping();
    logger.info('Status WhatsApp:', { connected: whatsappStatus });

    // 8. Configura handlers de erro e shutdown
    process.on('uncaughtException', (error: Error) => {
      logger.error('Erro não tratado:', error);
      alertService.createAlert(
        AlertType.SYSTEM_ERROR,
        AlertSeverity.CRITICAL,
        {
          error: error.message,
          stack: error.stack
        }
      );
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error('Promise não tratada:', reason as Error);
      alertService.createAlert(
        AlertType.SYSTEM_ERROR,
        AlertSeverity.CRITICAL,
        {
          error: reason instanceof Error ? reason.message : String(reason)
        }
      );
    });

    process.on('SIGTERM', async () => {
      logger.info('Recebido sinal SIGTERM, iniciando shutdown...');
      await shutdown();
    });

    process.on('SIGINT', async () => {
      logger.info('Recebido sinal SIGINT, iniciando shutdown...');
      await shutdown();
    });

    async function shutdown() {
      try {
        logger.info('Parando serviços...');
        await mainnetMonitor.stop();
        await backupService.stop();
        await auditService.stop();

        logger.info('Fechando conexões...');
        await connection.close();
        await redis.quit();

        logger.info('Sistema parado com sucesso');
        process.exit(0);
      } catch (error) {
        logger.error('Erro durante shutdown:', error as Error);
        process.exit(1);
      }
    }

    logger.info('Sistema iniciado com sucesso!');

  } catch (error) {
    logger.error('Erro fatal durante inicialização:', error as Error);
    process.exit(1);
  }
}

main();