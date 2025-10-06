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
  console.log("🚀 DEPLOY MINIMAL GAS - POLYGON MAINNET");
  console.log("==========================================");
  console.log("🌐 Rede: Polygon Mainnet");
  const deployer = await ethers.provider.getSigner();
  console.log("👤 Deployer:", await deployer.getAddress());
  
  // Verificar saldo inicial
  const initialBalance = await ethers.provider.getBalance(await deployer.getAddress());
  const initialBalanceEth = ethers.formatEther(initialBalance);
  console.log("💰 Saldo inicial:", initialBalanceEth, "MATIC");
  
  // Configurar gas MÍNIMO possível
  const feeData = await ethers.provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || 0n;
  
  // Usar gas price MÍNIMO (1% do atual)
  const minimalGasPrice = currentGasPrice * 1n / 100n;
  
  console.log("⛽ Gas Price atual:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("⛽ Gas Price mínimo:", ethers.formatUnits(minimalGasPrice, "gwei"), "gwei");
  
  // Calcular custo estimado com gas mínimo
  const estimatedGas = 4000000; // 4M gas (muito reduzido)
  const estimatedCost = (BigInt(estimatedGas) * minimalGasPrice) / BigInt(10**18);
  const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
  
  console.log("💰 Custo estimado:", estimatedCostEth.toFixed(8), "MATIC");
  console.log("⚠️  AVISO: Gas price muito baixo - pode demorar para confirmar");
  
  const startTime = Date.now();
  const deployedContracts: Partial<DeployedContracts> = {};
  
  try {
    // 1. Deploy SmartWallet com gas mínimo
    console.log("\n📝 DEPLOYANDO SMARTWALLET (MINIMAL GAS)");
    console.log("==========================================");
    console.log("⏳ Aguardando confirmação (pode demorar muito)...");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy({
      gasPrice: minimalGasPrice,
      gasLimit: 1500000 // 1.5M gas limit
    });
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    deployedContracts.SmartWallet = smartWalletAddress;
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // 2. Deploy SmartWalletV2 com gas mínimo
    console.log("\n📝 DEPLOYANDO SMARTWALLETV2 (MINIMAL GAS)");
    console.log("==========================================");
    console.log("⏳ Aguardando confirmação (pode demorar muito)...");
    
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    const smartWalletV2 = await SmartWalletV2.deploy({
      gasPrice: minimalGasPrice,
      gasLimit: 1800000 // 1.8M gas limit
    });
    await smartWalletV2.waitForDeployment();
    const smartWalletV2Address = await smartWalletV2.getAddress();
    deployedContracts.SmartWalletV2 = smartWalletV2Address;
    console.log("✅ SmartWalletV2 deployado em:", smartWalletV2Address);
    
    // 3. Deploy LiquidityPool com gas mínimo
    console.log("\n📝 DEPLOYANDO LIQUIDITYPOOL (MINIMAL GAS)");
    console.log("==========================================");
    console.log("⏳ Aguardando confirmação (pode demorar muito)...");
    
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    
    // Usar tokens reais do Polygon
    const usdtAddress = "0xc2132D5D0EBb5cC0fCb4c4C2C0C0C0C0C0C0C0C0";
    const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const poolFee = 30;
    
    const liquidityPool = await LiquidityPool.deploy(usdtAddress, usdcAddress, poolFee, {
      gasPrice: minimalGasPrice,
      gasLimit: 1200000 // 1.2M gas limit
    });
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    deployedContracts.LiquidityPool = liquidityPoolAddress;
    console.log("✅ LiquidityPool deployado em:", liquidityPoolAddress);
    
    // 4. Deploy SmartWalletProxy com gas mínimo
    console.log("\n📝 DEPLOYANDO SMARTWALLETPROXY (MINIMAL GAS)");
    console.log("==========================================");
    console.log("⏳ Aguardando confirmação (pode demorar muito)...");
    
    const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
    const proxyData = "0x";
    const smartWalletProxy = await SmartWalletProxy.deploy(smartWalletV2Address, proxyData, {
      gasPrice: minimalGasPrice,
      gasLimit: 300000 // 300K gas limit
    });
    await smartWalletProxy.waitForDeployment();
    const smartWalletProxyAddress = await smartWalletProxy.getAddress();
    deployedContracts.SmartWalletProxy = smartWalletProxyAddress;
    console.log("✅ SmartWalletProxy deployado em:", smartWalletProxyAddress);
    
    // 5. Configurações pós-deploy (apenas essenciais)
    console.log("\n⚙️  CONFIGURAÇÕES PÓS-DEPLOY (APENAS ESSENCIAIS)");
    console.log("==========================================");
    
    // Apenas despausar SmartWallet (essencial)
    console.log("🔓 Despausando SmartWallet...");
    try {
      await smartWallet.unpause({
        gasPrice: minimalGasPrice,
        gasLimit: 50000
      });
      console.log("✅ SmartWallet despausado");
    } catch (error) {
      console.log("⚠️  Erro ao despausar SmartWallet:", error.message);
    }
    
    // Pular TODAS as outras configurações para economizar gas
    console.log("ℹ️  Pulando TODAS as configurações adicionais para economizar gas");
    console.log("ℹ️  Configure manualmente depois se necessário");
    
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
      gasPrice: minimalGasPrice.toString(),
      polygonscanLinks: {
        SmartWallet: `https://polygonscan.com/address/${smartWalletAddress}`,
        SmartWalletV2: `https://polygonscan.com/address/${smartWalletV2Address}`,
        LiquidityPool: `https://polygonscan.com/address/${liquidityPoolAddress}`,
        SmartWalletProxy: `https://polygonscan.com/address/${smartWalletProxyAddress}`
      }
    };
    
    // Salvar em arquivo JSON
    const outputPath = path.join(__dirname, "..", "deployed-contracts-polygon-minimal.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 DEPLOY MINIMAL GAS CONCLUÍDO!");
    console.log("==========================================");
    console.log("⏱️  Tempo total:", deploymentTime, "ms");
    console.log("💰 Custo total:", totalCost.toFixed(8), "MATIC");
    console.log("⛽ Gas price usado:", ethers.formatUnits(minimalGasPrice, "gwei"), "gwei");
    console.log("📋 Endereços dos contratos:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🔗 Links dos contratos no Polygonscan:");
    console.log(`SmartWallet: ${deploymentInfo.polygonscanLinks.SmartWallet}`);
    console.log(`SmartWalletV2: ${deploymentInfo.polygonscanLinks.SmartWalletV2}`);
    console.log(`LiquidityPool: ${deploymentInfo.polygonscanLinks.LiquidityPool}`);
    console.log(`SmartWalletProxy: ${deploymentInfo.polygonscanLinks.SmartWalletProxy}`);
    
    console.log("\n💡 ECONOMIAS MÁXIMAS IMPLEMENTADAS:");
    console.log("✅ Gas price reduzido para 1% do atual");
    console.log("✅ Gas limits MÍNIMOS possíveis");
    console.log("✅ Apenas 1 configuração pós-deploy");
    console.log("✅ Nenhuma configuração adicional");
    console.log("✅ Deploy mais barato possível");
    
    console.log("\n⚠️  IMPORTANTE:");
    console.log("⚠️  Gas price muito baixo - transações podem demorar");
    console.log("⚠️  Configure funções adicionais manualmente depois");
    console.log("⚠️  Teste todas as funcionalidades após deploy");
    
    console.log("\n🎯 PRÓXIMOS PASSOS:");
    console.log("1. Verificar contratos no Polygonscan");
    console.log("2. Configurar funções adicionais manualmente");
    console.log("3. Testar funcionalidades básicas");
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
