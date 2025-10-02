import { ethers, upgrades } from "hardhat";
import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { Logger } from '../packages/common/src/infrastructure/logging/Logger';
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const logger = new Logger();
  logger.info("Iniciando deploy para mainnet...");

  try {
    // 1. Verifica ambiente
    logger.info("\nVerificando ambiente...");
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('Este script deve ser executado apenas em produção');
    }

    // 2. Verifica saldo
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    logger.info(`Saldo do deployer: ${ethers.formatEther(balance)} ETH`);

    if (balance < ethers.parseEther('1')) {
      throw new Error('Saldo insuficiente para deploy');
    }

    // 3. Deploy SmartWalletV2
    logger.info("\nDeployando SmartWalletV2...");
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    
    logger.info("Deployando proxy...");
    const proxy = await upgrades.deployProxy(SmartWalletV2, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    const implementationAddress = await getImplementationAddress(
      ethers.provider,
      proxyAddress
    );

    logger.info("SmartWallet deployed:");
    logger.info(`- Proxy: ${proxyAddress}`);
    logger.info(`- Implementation: ${implementationAddress}`);

    // 4. Verifica contrato
    logger.info("\nVerificando contrato...");
    const wallet = SmartWalletV2.attach(proxyAddress);

    // Verifica se está pausado (deve estar inicialmente)
    const isPaused = await wallet.paused();
    logger.info(`- Pausado: ${isPaused ? 'Sim' : 'Não'}`);
    if (!isPaused) {
      throw new Error('Contrato deveria estar pausado inicialmente');
    }

    // Verifica owner
    const owner = await wallet.owner();
    logger.info(`- Owner: ${owner}`);
    if (owner !== deployer.address) {
      throw new Error('Owner incorreto');
    }

    // 5. Configurações iniciais
    logger.info("\nConfigurando contrato...");

    // Whitelist tokens iniciais
    const tokens = {
      // Polygon Mainnet
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",

      // BSC Mainnet
      BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      CAKE: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      BTCB: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
      ETH: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"
    };

    for (const [symbol, address] of Object.entries(tokens)) {
      logger.info(`Whitelisting ${symbol}...`);
      await wallet.whitelistToken(address);
    }

    // 6. Verifica no Etherscan
    logger.info("\nVerificando contratos no Etherscan...");
    await hre.run("verify:verify", {
      address: implementationAddress,
      constructorArguments: []
    });

    // 7. Despausa o contrato
    logger.info("\nDespausando contrato...");
    await wallet.unpause();

    logger.info("\nDeploy concluído com sucesso!");

    // 8. Salva endereços
    const addresses = {
      proxy: proxyAddress,
      implementation: implementationAddress,
      owner: owner,
      network: hre.network.name,
      timestamp: new Date().toISOString()
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployed-addresses.json',
      JSON.stringify(addresses, null, 2)
    );

    logger.info("\nEndereços salvos em deployed-addresses.json");

  } catch (error) {
    logger.error("Erro durante deploy:", error as Error);
    process.exit(1);
  }
}

main();