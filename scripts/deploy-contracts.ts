import { ethers } from "hardhat";
import { Contract } from "ethers";
import * as fs from "fs";
import * as path from "path";

interface DeployedContracts {
  SmartWallet: string;
  SmartWalletV2: string;
  LiquidityPool: string;
  SmartWalletProxy: string;
  deploymentDate: string;
  network: string;
  gasUsed: string;
}

async function main() {
  console.log("🚀 Iniciando deploy dos contratos Notus...");
  console.log("🌐 Rede:", hre.network.name);
  console.log("👤 Deployer:", await ethers.provider.getSigner().getAddress());
  
  const startTime = Date.now();
  const deployedContracts: Partial<DeployedContracts> = {};
  
  try {
    // 1. Deploy SmartWallet
    console.log("\n📝 Deployando SmartWallet...");
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy();
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    deployedContracts.SmartWallet = smartWalletAddress;
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // 2. Deploy SmartWalletV2
    console.log("\n📝 Deployando SmartWalletV2...");
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    const smartWalletV2 = await SmartWalletV2.deploy();
    await smartWalletV2.waitForDeployment();
    const smartWalletV2Address = await smartWalletV2.getAddress();
    deployedContracts.SmartWalletV2 = smartWalletV2Address;
    console.log("✅ SmartWalletV2 deployado em:", smartWalletV2Address);
    
    // 3. Deploy LiquidityPool
    console.log("\n📝 Deployando LiquidityPool...");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy();
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    deployedContracts.LiquidityPool = liquidityPoolAddress;
    console.log("✅ LiquidityPool deployado em:", liquidityPoolAddress);
    
    // 4. Deploy SmartWalletProxy
    console.log("\n📝 Deployando SmartWalletProxy...");
    const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
    const smartWalletProxy = await SmartWalletProxy.deploy();
    await smartWalletProxy.waitForDeployment();
    const smartWalletProxyAddress = await smartWalletProxy.getAddress();
    deployedContracts.SmartWalletProxy = smartWalletProxyAddress;
    console.log("✅ SmartWalletProxy deployado em:", smartWalletProxyAddress);
    
    // 5. Salvar informações do deploy
    const endTime = Date.now();
    const deploymentTime = endTime - startTime;
    
    const deploymentInfo: DeployedContracts = {
      SmartWallet: smartWalletAddress,
      SmartWalletV2: smartWalletV2Address,
      LiquidityPool: liquidityPoolAddress,
      SmartWalletProxy: smartWalletProxyAddress,
      deploymentDate: new Date().toISOString(),
      network: hre.network.name,
      gasUsed: `${deploymentTime}ms`
    };
    
    // Salvar em arquivo JSON
    const outputPath = path.join(__dirname, "..", "deployed-contracts.json");
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 Deploy concluído com sucesso!");
    console.log("⏱️  Tempo total:", deploymentTime, "ms");
    console.log("📋 Endereços dos contratos:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // 6. Verificar contratos (apenas em mainnet)
    if (hre.network.name === "mainnet") {
      console.log("\n🔍 Iniciando verificação dos contratos...");
      
      try {
        console.log("🔍 Verificando SmartWallet...");
        await hre.run("verify:verify", {
          address: smartWalletAddress,
          constructorArguments: [],
        });
        console.log("✅ SmartWallet verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWallet:", error);
      }
      
      try {
        console.log("🔍 Verificando SmartWalletV2...");
        await hre.run("verify:verify", {
          address: smartWalletV2Address,
          constructorArguments: [],
        });
        console.log("✅ SmartWalletV2 verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWalletV2:", error);
      }
      
      try {
        console.log("🔍 Verificando LiquidityPool...");
        await hre.run("verify:verify", {
          address: liquidityPoolAddress,
          constructorArguments: [],
        });
        console.log("✅ LiquidityPool verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar LiquidityPool:", error);
      }
      
      try {
        console.log("🔍 Verificando SmartWalletProxy...");
        await hre.run("verify:verify", {
          address: smartWalletProxyAddress,
          constructorArguments: [],
        });
        console.log("✅ SmartWalletProxy verificado");
      } catch (error) {
        console.log("⚠️  Erro ao verificar SmartWalletProxy:", error);
      }
    }
    
    console.log("\n📄 Informações salvas em: deployed-contracts.json");
    console.log("🔗 Verifique os contratos no Etherscan:");
    if (hre.network.name === "mainnet") {
      console.log(`SmartWallet: https://etherscan.io/address/${smartWalletAddress}`);
      console.log(`SmartWalletV2: https://etherscan.io/address/${smartWalletV2Address}`);
      console.log(`LiquidityPool: https://etherscan.io/address/${liquidityPoolAddress}`);
      console.log(`SmartWalletProxy: https://etherscan.io/address/${smartWalletProxyAddress}`);
    }
    
  } catch (error) {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });