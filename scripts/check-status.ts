import { ethers } from 'ethers';
import { createConnection } from 'typeorm';
import Redis from 'ioredis';
import { Logger } from '../packages/common/src/infrastructure/logging/Logger';
import { NotusWhatsAppService } from '../packages/common/src/infrastructure/whatsapp/NotusWhatsAppService';
import { SmartWalletV2 } from '../typechain-types';
import ormconfig from '../ormconfig';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const logger = new Logger();
  logger.info('Verificando status do sistema...');

  try {
    // 1. Verifica Blockchain
    logger.info('\nVerificando conexões blockchain...');
    
    const providers = {
      polygon: new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL),
      bsc: new ethers.JsonRpcProvider(process.env.BSC_RPC_URL),
      ethereum: new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
    };

    for (const [network, provider] of Object.entries(providers)) {
      try {
        const block = await provider.getBlockNumber();
        const gasPrice = await provider.getFeeData();
        console.log(`\n${network.toUpperCase()}:`);
        console.log(`- Bloco atual: ${block}`);
        console.log(`- Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} gwei`);
        console.log(`- Status: ✅ OK`);
      } catch (error) {
        console.log(`\n${network.toUpperCase()}:`);
        console.log(`- Status: ❌ ERRO`);
        console.log(`- Erro: ${(error as Error).message}`);
      }
    }

    // 2. Verifica Smart Contract
    logger.info('\nVerificando smart contract...');
    
    const smartWalletAddress = process.env.SMART_WALLET_ADDRESS;
    if (smartWalletAddress) {
      try {
        const contract = await ethers.getContractAt(
          'SmartWalletV2',
          smartWalletAddress
        ) as SmartWalletV2;

        const isPaused = await contract.paused();
        console.log('\nSMART CONTRACT:');
        console.log(`- Endereço: ${smartWalletAddress}`);
        console.log(`- Pausado: ${isPaused ? 'Sim' : 'Não'}`);
        console.log(`- Status: ✅ OK`);
      } catch (error) {
        console.log('\nSMART CONTRACT:');
        console.log(`- Status: ❌ ERRO`);
        console.log(`- Erro: ${(error as Error).message}`);
      }
    }

    // 3. Verifica Banco de Dados
    logger.info('\nVerificando banco de dados...');
    
    try {
      const connection = await createConnection(ormconfig);
      
      // Verifica tabelas
      const tables = await connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      // Verifica contagens
      const counts = await Promise.all(
        tables.map(async (table: { table_name: string }) => {
          const count = await connection.query(`SELECT COUNT(*) FROM ${table.table_name}`);
          return { table: table.table_name, count: count[0].count };
        })
      );

      console.log('\nBANCO DE DADOS:');
      console.log(`- Status: ✅ Conectado`);
      console.log('- Tabelas:');
      counts.forEach(({ table, count }) => {
        console.log(`  • ${table}: ${count} registros`);
      });

      await connection.close();
    } catch (error) {
      console.log('\nBANCO DE DADOS:');
      console.log(`- Status: ❌ ERRO`);
      console.log(`- Erro: ${(error as Error).message}`);
    }

    // 4. Verifica Redis
    logger.info('\nVerificando Redis...');
    
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
      });

      const ping = await redis.ping();
      const info = await redis.info();
      const memory = await redis.info('memory');

      console.log('\nREDIS:');
      console.log(`- Status: ✅ ${ping}`);
      console.log(`- Versão: ${info.split('\n')[1].split(':')[1]}`);
      console.log(`- Memória: ${memory.split('\n')[1].split(':')[1]}`);

      await redis.quit();
    } catch (error) {
      console.log('\nREDIS:');
      console.log(`- Status: ❌ ERRO`);
      console.log(`- Erro: ${(error as Error).message}`);
    }

    // 5. Verifica WhatsApp
    logger.info('\nVerificando WhatsApp...');
    
    try {
      const whatsapp = new NotusWhatsAppService(
        process.env.NOTUS_API_KEY!,
        process.env.NOTUS_WEBHOOK_URL!,
        logger
      );

      const status = await whatsapp.ping();

      console.log('\nWHATSAPP:');
      console.log(`- Status: ${status ? '✅ Conectado' : '❌ Desconectado'}`);
      console.log(`- Webhook URL: ${process.env.NOTUS_WEBHOOK_URL}`);
    } catch (error) {
      console.log('\nWHATSAPP:');
      console.log(`- Status: ❌ ERRO`);
      console.log(`- Erro: ${(error as Error).message}`);
    }

    // 6. Verifica Backup
    logger.info('\nVerificando backup...');
    
    try {
      const backupPath = process.env.BACKUP_PATH;
      const fs = require('fs');
      
      const stats = fs.statSync(backupPath);
      const files = fs.readdirSync(backupPath);
      const latestBackup = files
        .map(file => ({
          name: file,
          time: fs.statSync(`${backupPath}/${file}`).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)[0];

      console.log('\nBACKUP:');
      console.log(`- Status: ✅ OK`);
      console.log(`- Diretório: ${backupPath}`);
      console.log(`- Último backup: ${new Date(latestBackup.time).toISOString()}`);
      console.log(`- Total arquivos: ${files.length}`);
    } catch (error) {
      console.log('\nBACKUP:');
      console.log(`- Status: ❌ ERRO`);
      console.log(`- Erro: ${(error as Error).message}`);
    }

    // 7. Verifica Variáveis de Ambiente
    logger.info('\nVerificando variáveis de ambiente...');
    
    const requiredEnvVars = [
      'NODE_ENV',
      'POLYGON_RPC_URL',
      'BSC_RPC_URL',
      'ETHEREUM_RPC_URL',
      'DATABASE_URL',
      'REDIS_HOST',
      'NOTUS_API_KEY',
      'JWT_SECRET',
      'SMART_WALLET_ADDRESS'
    ];

    console.log('\nVARIÁVEIS DE AMBIENTE:');
    requiredEnvVars.forEach(variable => {
      const exists = process.env[variable] !== undefined;
      console.log(`- ${variable}: ${exists ? '✅' : '❌'}`);
    });

    logger.info('\nVerificação concluída!');

  } catch (error) {
    logger.error('Erro durante verificação:', error as Error);
    process.exit(1);
  }
}

main();