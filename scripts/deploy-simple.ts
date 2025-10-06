import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 DEPLOY SIMPLES - APENAS SMARTWALLET");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  const balanceEth = ethers.formatEther(balance);
  
  console.log("👤 Deployer:", await deployer.getAddress());
  console.log("💰 Saldo:", balanceEth, "ETH");
  
  // Verificar se tem saldo mínimo
  if (parseFloat(balanceEth) < 0.0005) {
    throw new Error("❌ Saldo insuficiente! Mínimo: 0.0005 ETH");
  }
  
  console.log("⚠️  AVISO: Saldo baixo, tentando deploy...");
  
  try {
    console.log("\n📝 DEPLOYANDO SMARTWALLET");
    console.log("==========================================");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    
    // Deploy com configurações mínimas
    const smartWallet = await SmartWallet.deploy();
    await smartWallet.waitForDeployment();
    
    const smartWalletAddress = await smartWallet.getAddress();
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // Salvar resultado
    const result = {
      SmartWallet: smartWalletAddress,
      deploymentDate: new Date().toISOString(),
      network: "mainnet",
      deployer: await deployer.getAddress(),
      etherscanLink: `https://etherscan.io/address/${smartWalletAddress}`
    };
    
    const outputPath = path.join(__dirname, "..", "deployed-smartwallet.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log("\n🎉 DEPLOY CONCLUÍDO!");
    console.log("📄 Resultado salvo em: deployed-smartwallet.json");
    console.log("🔗 Etherscan:", result.etherscanLink);
    
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
