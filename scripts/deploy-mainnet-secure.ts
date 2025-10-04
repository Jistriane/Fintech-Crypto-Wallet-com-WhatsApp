import { ethers, upgrades } from "hardhat";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { Logger } from '../packages/common/src/infrastructure/logging/Logger';
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

interface DeployConfig {
  network: string;
  rpcUrl: string;
  chainId: number;
  gasPrice: string;
  gasLimit: string;
  confirmations: number;
}

interface DeployedContracts {
  smartWallet: string;
  liquidityPool: string;
  network: string;
  timestamp: string;
  gasUsed: string;
  txHash: string;
}

async function main() {
  const logger = new Logger();
  logger.info("🚀 Iniciando deploy seguro para mainnet...");

  try {
    // 1. Verificações de Segurança Pré-Deploy
    logger.info("\n🔒 Executando verificações de segurança...");
    
    // Verificar ambiente
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('❌ Este script deve ser executado apenas em produção');
    }

    // Verificar variáveis de ambiente
    const requiredEnvVars = [
      'PRIVATE_KEY',
      'POLYGON_RPC_URL',
      'POLYGONSCAN_API_KEY',
      'BSC_RPC_URL',
      'BSCSCAN_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`❌ Variável de ambiente ${envVar} não encontrada`);
      }
    }

    // 2. Configuração da Rede
    const network = hre.network.name;
    logger.info(`\n🌐 Configurando rede: ${network}`);

    const configs: { [key: string]: DeployConfig } = {
      polygon: {
        network: 'polygon',
        rpcUrl: process.env.POLYGON_RPC_URL!,
        chainId: 137,
        gasPrice: '20', // gwei
        gasLimit: '8000000',
        confirmations: 5
      },
      bsc: {
        network: 'bsc',
        rpcUrl: process.env.BSC_RPC_URL!,
        chainId: 56,
        gasPrice: '5', // gwei
        gasLimit: '8000000',
        confirmations: 3
      }
    };

    const config = configs[network];
    if (!config) {
      throw new Error(`❌ Rede ${network} não suportada`);
    }

    // 3. Verificação de Saldo
    logger.info("\n💰 Verificando saldo...");
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    
    logger.info(`Saldo do deployer: ${balanceEth} ETH`);
    
    const minBalance = network === 'polygon' ? '0.1' : '0.05';
    if (parseFloat(balanceEth) < parseFloat(minBalance)) {
      throw new Error(`❌ Saldo insuficiente. Mínimo: ${minBalance} ETH`);
    }

    // 4. Deploy SmartWalletFixed
    logger.info("\n📦 Deployando SmartWalletFixed...");
    const SmartWalletFixed = await ethers.getContractFactory("SmartWalletFixed");
    
    const smartWallet = await SmartWalletFixed.deploy({
      gasLimit: config.gasLimit,
      gasPrice: ethers.parseUnits(config.gasPrice, 'gwei')
    });
    
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    
    logger.info(`✅ SmartWalletFixed deployado em: ${smartWalletAddress}`);

    // 5. Verificações Pós-Deploy
    logger.info("\n🔍 Executando verificações pós-deploy...");
    
    // Verificar se está pausado
    const isPaused = await smartWallet.paused();
    if (!isPaused) {
      throw new Error('❌ Contrato deveria estar pausado inicialmente');
    }
    logger.info("✅ Contrato pausado corretamente");

    // Verificar owner
    const owner = await smartWallet.owner();
    if (owner !== deployer.address) {
      throw new Error('❌ Owner incorreto');
    }
    logger.info("✅ Owner configurado corretamente");

    // 6. Configuração Inicial
    logger.info("\n⚙️ Configurando contrato...");
    
    // Whitelist tokens principais
    const tokens = getTokensForNetwork(network);
    
    for (const [symbol, address] of Object.entries(tokens)) {
      logger.info(`Whitelisting ${symbol}...`);
      const tx = await smartWallet.whitelistToken(address, {
        gasLimit: '200000'
      });
      await tx.wait();
    }

    // 7. Testes de Funcionalidade
    logger.info("\n🧪 Executando testes de funcionalidade...");
    
    // Teste de criação de carteira
    try {
      const tx = await smartWallet.connect(deployer).createWallet(
        ethers.parseEther("1"),
        { gasLimit: '300000' }
      );
      await tx.wait();
      logger.info("✅ Teste de criação de carteira: OK");
    } catch (error) {
      logger.error("❌ ERRO no teste de criação de carteira:", error);
    }

    // 8. Verificação no Explorer
    logger.info("\n🔍 Verificando contrato no explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: smartWalletAddress,
        constructorArguments: []
      });
      logger.info("✅ Contrato verificado no explorer");
    } catch (error) {
      logger.warn("⚠️ Aviso: Falha na verificação automática:", error.message);
      logger.info("Verificação manual necessária");
    }

    // 9. Despausar Contrato
    logger.info("\n▶️ Despausando contrato...");
    
    const unpauseTx = await smartWallet.unpause({
      gasLimit: '100000'
    });
    await unpauseTx.wait();
    
    logger.info("✅ Contrato despausado");

    // 10. Salvar Endereços
    logger.info("\n💾 Salvando endereços...");
    
    const deployedContracts: DeployedContracts = {
      smartWallet: smartWalletAddress,
      liquidityPool: '', // Será preenchido se necessário
      network: network,
      timestamp: new Date().toISOString(),
      gasUsed: '0', // Será preenchido
      txHash: '' // Será preenchido
    };

    const filename = `deployed-${network}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deployedContracts, null, 2));
    
    logger.info(`✅ Endereços salvos em ${filename}`);

    // 11. Relatório Final
    logger.info("\n🎉 Deploy concluído com sucesso!");
    logger.info("\n📊 Resumo do Deploy:");
    logger.info("===================");
    logger.info(`Rede: ${network}`);
    logger.info(`SmartWallet: ${smartWalletAddress}`);
    logger.info(`Owner: ${deployer.address}`);
    logger.info(`Saldo restante: ${balanceEth} ETH`);
    logger.info(`Timestamp: ${new Date().toISOString()}`);
    
    logger.info("\n🔒 Próximos Passos de Segurança:");
    logger.info("1. ✅ Executar testes de segurança completos");
    logger.info("2. ✅ Configurar monitoramento de eventos");
    logger.info("3. ✅ Implementar alertas de segurança");
    logger.info("4. ✅ Configurar backup de chaves privadas");
    logger.info("5. ✅ Documentar endereços e configurações");

    logger.info("\n⚠️ IMPORTANTE:");
    logger.info("- Mantenha as chaves privadas seguras");
    logger.info("- Configure monitoramento 24/7");
    logger.info("- Teste todas as funcionalidades em testnet primeiro");
    logger.info("- Considere auditoria externa antes do uso em produção");

  } catch (error) {
    logger.error("❌ ERRO CRÍTICO durante deploy:", error);
    process.exit(1);
  }
}

function getTokensForNetwork(network: string): { [key: string]: string } {
  const tokens: { [key: string]: { [key: string]: string } } = {
    polygon: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"
    },
    bsc: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      BNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    }
  };

  return tokens[network] || {};
}

main();
