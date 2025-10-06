import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 DEPLOY ULTRA LOW GAS");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  const balanceEth = ethers.formatEther(balance);
  
  console.log("👤 Deployer:", await deployer.getAddress());
  console.log("💰 Saldo:", balanceEth, "ETH");
  
  // Verificar gas price atual
  const feeData = await ethers.provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || 0n;
  const ultraLowGasPrice = currentGasPrice * 50n / 100n; // 50% do gas price atual
  
  console.log("⛽ Gas Price atual:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("⛽ Gas Price ultra baixo:", ethers.formatUnits(ultraLowGasPrice, "gwei"), "gwei");
  
  try {
    console.log("\n📝 DEPLOYANDO SMARTWALLET COM GAS ULTRA BAIXO");
    console.log("==========================================");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    
    // Deploy com gas ultra baixo
    const smartWallet = await SmartWallet.deploy({
      gasPrice: ultraLowGasPrice,
      gasLimit: 1500000 // Gas limit muito baixo
    });
    
    console.log("⏳ Aguardando confirmação...");
    await smartWallet.waitForDeployment();
    
    const smartWalletAddress = await smartWallet.getAddress();
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // Salvar resultado
    const result = {
      SmartWallet: smartWalletAddress,
      deploymentDate: new Date().toISOString(),
      network: "mainnet",
      deployer: await deployer.getAddress(),
      gasPrice: ultraLowGasPrice.toString(),
      etherscanLink: `https://etherscan.io/address/${smartWalletAddress}`
    };
    
    const outputPath = path.join(__dirname, "..", "deployed-smartwallet-ultra-low.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log("\n🎉 DEPLOY CONCLUÍDO!");
    console.log("📄 Resultado salvo em: deployed-smartwallet-ultra-low.json");
    console.log("🔗 Etherscan:", result.etherscanLink);
    
  } catch (error) {
    console.error("❌ ERRO NO DEPLOY:", error);
    
    // Verificar saldo após erro
    const newBalance = await ethers.provider.getBalance(await deployer.getAddress());
    const newBalanceEth = ethers.formatEther(newBalance);
    console.log("💰 Saldo após erro:", newBalanceEth, "ETH");
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error);
    process.exit(1);
  });
