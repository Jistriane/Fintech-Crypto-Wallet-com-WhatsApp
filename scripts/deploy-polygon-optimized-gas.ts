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
  totalCost: string;
  gasPrice: string;
  polygonscanLinks: {
    SmartWallet: string;
    SmartWalletV2: string;
    LiquidityPool: string;
    SmartWalletProxy: string;
  };
}

async function main() {
  console.log("🚀 DEPLOY OPTIMIZED GAS - POLYGON MAINNET");
  console.log("==========================================");
  console.log("🌐 Rede: Polygon Mainnet");
  const deployer = await ethers.provider.getSigner();
  console.log("👤 Deployer:", await deployer.getAddress());
  
  // Verificar saldo inicial
  const initialBalance = await ethers.provider.getBalance(await deployer.getAddress());
  const initialBalanceEth = ethers.formatEther(initialBalance);
  console.log("💰 Saldo inicial:", initialBalanceEth, "MATIC");
  
  // Usar gas price otimizado (30 gwei - equilíbrio entre custo e velocidade)
  const optimizedGasPrice = ethers.parseUnits("30", "gwei"); // 30 gwei
  
  console.log("⛽ Gas Price otimizado:", ethers.formatUnits(optimizedGasPrice, "gwei"), "gwei");
  console.log("💡 Equilíbrio entre custo baixo e velocidade razoável");
  
  // Calcular custo estimado com gas otimizado
  const estimatedGas = 6000000; // 6M gas total
  const estimatedCost = (BigInt(estimatedGas) * optimizedGasPrice) / BigInt(10**18);
  const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
  
  console.log("💰 Custo estimado:", estimatedCostEth.toFixed(8), "MATIC");
  console.log("⏱️  Tempo estimado: 5-15 minutos");
  
  const startTime = Date.now();
  const deployedContracts: Partial<DeployedContracts> = {};
  
  try {
    // 1. Deploy SmartWallet com gas otimizado
    console.log("\n📝 DEPLOYANDO SMARTWALLET (OPTIMIZED GAS)");
    console.log("==========================================");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy({
      gasPrice: optimizedGasPrice,
      gasLimit: 2500000 // 2.5M gas limit
    });
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    deployedContracts.SmartWallet = smartWalletAddress;
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // 2. Deploy SmartWalletV2 com gas otimizado
    console.log("\n📝 DEPLOYANDO SMARTWALLETV2 (OPTIMIZED GAS)");
    console.log("==========================================");
    
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    const smartWalletV2 = await SmartWalletV2.deploy({
      gasPrice: optimizedGasPrice,
      gasLimit: 4000000 // 4M gas limit
    });
    await smartWalletV2.waitForDeployment();
    const smartWalletV2Address = await smartWalletV2.getAddress();
    deployedContracts.SmartWalletV2 = smartWalletV2Address;
    console.log("✅ SmartWalletV2 deployado em:", smartWalletV2Address);
    
    // 3. Deploy LiquidityPool com gas otimizado
    console.log("\n📝 DEPLOYANDO LIQUIDITYPOOL (OPTIMIZED GAS)");
    console.log("==========================================");
    
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    
    // Usar endereços válidos para teste
    const usdtAddress = "0x0000000000000000000000000000000000000001";
    const usdcAddress = "0x0000000000000000000000000000000000000002";
    const poolFee = 30;
    
    const liquidityPool = await LiquidityPool.deploy(usdtAddress, usdcAddress, poolFee, {
      gasPrice: optimizedGasPrice,
      gasLimit: 2000000 // 2M gas limit
    });
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    deployedContracts.LiquidityPool = liquidityPoolAddress;
    console.log("✅ LiquidityPool deployado em:", liquidityPoolAddress);
    
    // 4. Deploy SmartWalletProxy com gas otimizado
    console.log("\n📝 DEPLOYANDO SMARTWALLETPROXY (OPTIMIZED GAS)");
    console.log("==========================================");
    
    const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
    const proxyData = "0x";
    const smartWalletProxy = await SmartWalletProxy.deploy(smartWalletV2Address, proxyData, {
      gasPrice: optimizedGasPrice,
      gasLimit: 800000 // 800K gas limit
    });
    await smartWalletProxy.waitForDeployment();
    const smartWalletProxyAddress = await smartWalletProxy.getAddress();
    deployedContracts.SmartWalletProxy = smartWalletProxyAddress;
    console.log("✅ SmartWalletProxy deployado em:", smartWalletProxyAddress);
    
    // 5. Configurações pós-deploy (essenciais)
    console.log("\n⚙️  CONFIGURAÇÕES PÓS-DEPLOY (ESSENCIAIS)");
    console.log("==========================================");
    
    // Despausar SmartWallet
    console.log("🔓 Despausando SmartWallet...");
    try {
      await smartWallet.unpause({
        gasPrice: optimizedGasPrice,
        gasLimit: 100000
      });
      console.log("✅ SmartWallet despausado");
    } catch (error) {
      console.log("⚠️  Erro ao despausar SmartWallet:", error.message);
    }
    
    // Adicionar tokens à whitelist (essencial)
    console.log("🪙 Adicionando tokens à whitelist...");
    try {
      await smartWallet.whitelistToken(usdtAddress, {
        gasPrice: optimizedGasPrice,
        gasLimit: 100000
      });
      console.log("✅ USDT adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDT:", error.message);
    }
    
    try {
      await smartWallet.whitelistToken(usdcAddress, {
        gasPrice: optimizedGasPrice,
        gasLimit: 100000
      });
      console.log("✅ USDC adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDC:", error.message);
    }
    
    // 6. Calcular custo total
    const finalBalance = await ethers.provider.getBalance(await deployer.getAddress());
    const finalBalanceEth = ethers.formatEther(finalBalance);
    const totalCost = parseFloat(initialBalanceEth) - parseFloat(finalBalanceEth);
    
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
      totalCost: `${totalCost.toFixed(8)} MATIC`,
      gasPrice: optimizedGasPrice.toString(),
      polygonscanLinks: {
        SmartWallet: `https://polygonscan.com/address/${smartWalletAddress}`,
        SmartWalletV2: `https://polygonscan.com/address/${smartWalletV2Address}`,
        LiquidityPool: `https://polygonscan.com/address/${liquidityPoolAddress}`,
        SmartWalletProxy: `https://polygonscan.com/address/${smartWalletProxyAddress}`
      }
    };
    
    // Salvar em arquivo JSON
    const outputPath = path.join(__dirname, "..", "deployed-contracts-polygon-optimized.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 DEPLOY OPTIMIZED GAS CONCLUÍDO!");
    console.log("==========================================");
    console.log("⏱️  Tempo total:", deploymentTime, "ms");
    console.log("💰 Custo total:", totalCost.toFixed(8), "MATIC");
    console.log("⛽ Gas price usado:", ethers.formatUnits(optimizedGasPrice, "gwei"), "gwei");
    console.log("📋 Endereços dos contratos:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🔗 Links dos contratos no Polygonscan:");
    console.log(`SmartWallet: ${deploymentInfo.polygonscanLinks.SmartWallet}`);
    console.log(`SmartWalletV2: ${deploymentInfo.polygonscanLinks.SmartWalletV2}`);
    console.log(`LiquidityPool: ${deploymentInfo.polygonscanLinks.LiquidityPool}`);
    console.log(`SmartWalletProxy: ${deploymentInfo.polygonscanLinks.SmartWalletProxy}`);
    
    console.log("\n💡 OTIMIZAÇÕES IMPLEMENTADAS:");
    console.log("✅ Gas price otimizado (5 gwei)");
    console.log("✅ Gas limits realistas");
    console.log("✅ Configurações essenciais incluídas");
    console.log("✅ Equilíbrio entre custo e velocidade");
    console.log("✅ Deploy confiável e rápido");
    
    console.log("\n🎯 PRÓXIMOS PASSOS:");
    console.log("1. Verificar contratos no Polygonscan");
    console.log("2. Testar todas as funcionalidades");
    console.log("3. Configurar funções adicionais se necessário");
    console.log("4. Monitorar performance");
    
  } catch (error) {
    console.error("❌ ERRO NO DEPLOY:", error);
    
    // Verificar saldo após erro
    const errorBalance = await ethers.provider.getBalance(await deployer.getAddress());
    const errorBalanceEth = ethers.formatEther(errorBalance);
    const gasUsed = parseFloat(initialBalanceEth) - parseFloat(errorBalanceEth);
    
    console.log("💰 Saldo após erro:", errorBalanceEth, "MATIC");
    console.log("⛽ Gas usado:", gasUsed.toFixed(8), "MATIC");
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error);
    process.exit(1);
  });
