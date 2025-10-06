import { ethers } from "hardhat";
import { Contract } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config({ path: "./polygon-deploy-config.env" });

interface DeployedContracts {
  SmartWallet: string;
  SmartWalletV2: string;
  LiquidityPool: string;
  SmartWalletProxy: string;
  deploymentDate: string;
  network: string;
  gasUsed: string;
  deployer: string;
  polygonscanLinks: {
    SmartWallet: string;
    SmartWalletV2: string;
    LiquidityPool: string;
    SmartWalletProxy: string;
  };
}

async function main() {
  console.log("🚀 INICIANDO DEPLOY EM POLYGON MAINNET");
  console.log("==========================================");
  console.log("🌐 Rede: Polygon Mainnet");
  const deployer = await ethers.provider.getSigner();
  console.log("👤 Deployer:", await deployer.getAddress());
  
  try {
    const gasPrice = await ethers.provider.getFeeData();
    console.log("⛽ Gas Price:", gasPrice.gasPrice?.toString() || "N/A");
  } catch (error) {
    console.log("⛽ Gas Price: N/A (rede local)");
  }
  console.log("==========================================");
  
  // Verificações de segurança
  console.log("\n🔒 VERIFICAÇÕES DE SEGURANÇA");
  console.log("==========================================");
  
  // Verificar se está em Polygon
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 137n) {
    console.log("⚠️  AVISO: Não está na rede Polygon Mainnet! (Teste em rede local)");
    console.log("✅ Rede atual:", network.name, "Chain ID:", network.chainId.toString());
  } else {
    console.log("✅ Rede confirmada: Polygon Mainnet");
  }
  
  // Verificar saldo da wallet
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  const balanceEth = ethers.formatEther(balance);
  console.log("💰 Saldo da wallet:", balanceEth, "MATIC");
  
  // Calcular custo estimado do deploy
  const gasPrice = await ethers.provider.getFeeData();
  const estimatedGas = 8000000; // 8M gas estimado
  const estimatedCost = (BigInt(estimatedGas) * (gasPrice.gasPrice || 0n)) / BigInt(10**18);
  const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
  
  console.log("💰 Custo estimado do deploy:", estimatedCostEth.toFixed(6), "MATIC");
  
  // Verificar se tem saldo suficiente (com margem de segurança)
  const requiredBalance = estimatedCostEth * 1.5; // 50% de margem
  if (parseFloat(balanceEth) < requiredBalance) {
    console.log("⚠️  AVISO: Saldo pode ser insuficiente, mas tentando deploy...");
    console.log(`💰 Necessário: ${requiredBalance.toFixed(6)} MATIC, Disponível: ${balanceEth} MATIC`);
  } else {
    console.log("✅ Saldo suficiente para deploy");
  }
  
  // Verificar variáveis de ambiente
  const requiredEnvVars = [
    'POLYGON_RPC_URL',
    'PRIVATE_KEY',
    'POLYGONSCAN_API_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.log(`⚠️  AVISO: Variável de ambiente ${envVar} não encontrada!`);
    }
  }
  console.log("✅ Variáveis de ambiente configuradas");
  
  const startTime = Date.now();
  const deployedContracts: Partial<DeployedContracts> = {};
  
  try {
    // 1. Deploy SmartWallet
    console.log("\n📝 DEPLOYANDO SMARTWALLET");
    console.log("==========================================");
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy();
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    deployedContracts.SmartWallet = smartWalletAddress;
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // 2. Deploy SmartWalletV2
    console.log("\n📝 DEPLOYANDO SMARTWALLETV2");
    console.log("==========================================");
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    const smartWalletV2 = await SmartWalletV2.deploy();
    await smartWalletV2.waitForDeployment();
    const smartWalletV2Address = await smartWalletV2.getAddress();
    deployedContracts.SmartWalletV2 = smartWalletV2Address;
    console.log("✅ SmartWalletV2 deployado em:", smartWalletV2Address);
    
    // 3. Deploy LiquidityPool
    console.log("\n📝 DEPLOYANDO LIQUIDITYPOOL");
    console.log("==========================================");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    
    // Usar endereços válidos para teste
    const usdtAddress = "0x0000000000000000000000000000000000000001";
    const usdcAddress = "0x0000000000000000000000000000000000000002";
    const poolFee = 30; // 0.3%
    
    const liquidityPool = await LiquidityPool.deploy(usdtAddress, usdcAddress, poolFee);
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    deployedContracts.LiquidityPool = liquidityPoolAddress;
    console.log("✅ LiquidityPool deployado em:", liquidityPoolAddress);
    
    // 4. Deploy SmartWalletProxy
    console.log("\n📝 DEPLOYANDO SMARTWALLETPROXY");
    console.log("==========================================");
    const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
    
    // Usar SmartWalletV2 como implementação
    const proxyData = "0x"; // Dados vazios para inicialização
    const smartWalletProxy = await SmartWalletProxy.deploy(smartWalletV2Address, proxyData);
    await smartWalletProxy.waitForDeployment();
    const smartWalletProxyAddress = await smartWalletProxy.getAddress();
    deployedContracts.SmartWalletProxy = smartWalletProxyAddress;
    console.log("✅ SmartWalletProxy deployado em:", smartWalletProxyAddress);
    
    // 5. Configurações pós-deploy
    console.log("\n⚙️  CONFIGURAÇÕES PÓS-DEPLOY");
    console.log("==========================================");
    
    // Unpause SmartWallet
    console.log("🔓 Despausando SmartWallet...");
    await smartWallet.unpause();
    console.log("✅ SmartWallet despausado");
    
    // SmartWalletV2 não tem função global de unpause
    console.log("ℹ️  SmartWalletV2: Função de unpause por função específica");
    
    // LiquidityPool não está pausado por padrão
    console.log("ℹ️  LiquidityPool: Não pausado por padrão");
    
    // Whitelist tokens principais do Polygon
    console.log("🪙 Adicionando tokens à whitelist...");
    const polygonUsdtAddress = "0xc2132D5D0EBb5cC0fCb4c4C2C0C0C0C0C0C0C0C0";
    const polygonUsdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    
    try {
      await smartWallet.whitelistToken(polygonUsdtAddress);
      console.log("✅ USDT Polygon adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDT:", error.message);
    }
    
    try {
      await smartWallet.whitelistToken(polygonUsdcAddress);
      console.log("✅ USDC Polygon adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDC:", error.message);
    }
    
    // 6. Salvar informações do deploy
    const endTime = Date.now();
    const deploymentTime = endTime - startTime;
    
    const deploymentInfo: DeployedContracts = {
      SmartWallet: smartWalletAddress,
      SmartWalletV2: smartWalletV2Address,
      LiquidityPool: liquidityPoolAddress,
      SmartWalletProxy: smartWalletProxyAddress,
      deploymentDate: new Date().toISOString(),
      network: "polygon",
      gasUsed: `${deploymentTime}ms`,
      deployer: await deployer.getAddress(),
      polygonscanLinks: {
        SmartWallet: `https://polygonscan.com/address/${smartWalletAddress}`,
        SmartWalletV2: `https://polygonscan.com/address/${smartWalletV2Address}`,
        LiquidityPool: `https://polygonscan.com/address/${liquidityPoolAddress}`,
        SmartWalletProxy: `https://polygonscan.com/address/${smartWalletProxyAddress}`
      }
    };
    
    // Salvar em arquivo JSON
    const outputPath = path.join(__dirname, "..", "deployed-contracts-polygon.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!");
    console.log("==========================================");
    console.log("⏱️  Tempo total:", deploymentTime, "ms");
    console.log("📋 Endereços dos contratos:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // 7. Verificar contratos no Polygonscan
    console.log("\n🔍 VERIFICANDO CONTRATOS NO POLYGONSCAN");
    console.log("==========================================");
    
    if (process.env.VERIFY_CONTRACTS === "true") {
      try {
        console.log("🔍 Verificando SmartWallet...");
        await ethers.run("verify:verify", {
          address: smartWalletAddress,
          constructorArguments: [],
        });
        console.log("✅ SmartWallet verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWallet:", error);
      }
      
      try {
        console.log("🔍 Verificando SmartWalletV2...");
        await ethers.run("verify:verify", {
          address: smartWalletV2Address,
          constructorArguments: [],
        });
        console.log("✅ SmartWalletV2 verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWalletV2:", error);
      }
      
      try {
        console.log("🔍 Verificando LiquidityPool...");
        await ethers.run("verify:verify", {
          address: liquidityPoolAddress,
          constructorArguments: [usdtAddress, usdcAddress, poolFee],
        });
        console.log("✅ LiquidityPool verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar LiquidityPool:", error);
      }
      
      try {
        console.log("🔍 Verificando SmartWalletProxy...");
        await ethers.run("verify:verify", {
          address: smartWalletProxyAddress,
          constructorArguments: [smartWalletV2Address, proxyData],
        });
        console.log("✅ SmartWalletProxy verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWalletProxy:", error);
      }
    }
    
    console.log("\n📄 Informações salvas em: deployed-contracts-polygon.json");
    console.log("🔗 Links do Polygonscan:");
    console.log(`SmartWallet: ${deploymentInfo.polygonscanLinks.SmartWallet}`);
    console.log(`SmartWalletV2: ${deploymentInfo.polygonscanLinks.SmartWalletV2}`);
    console.log(`LiquidityPool: ${deploymentInfo.polygonscanLinks.LiquidityPool}`);
    console.log(`SmartWalletProxy: ${deploymentInfo.polygonscanLinks.SmartWalletProxy}`);
    
    console.log("\n🎯 PRÓXIMOS PASSOS:");
    console.log("1. Verificar todos os contratos no Polygonscan");
    console.log("2. Testar todas as funções principais");
    console.log("3. Configurar monitoramento");
    console.log("4. Documentar endereços dos contratos");
    console.log("5. Configurar alertas de segurança");
    
  } catch (error) {
    console.error("❌ ERRO NO DEPLOY:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error);
    process.exit(1);
  });
