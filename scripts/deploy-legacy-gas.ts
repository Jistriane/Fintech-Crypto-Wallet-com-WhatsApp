import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 DEPLOY COM GAS LEGACY (ECONOMIA MÁXIMA)");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  const balanceEth = ethers.formatEther(balance);
  
  console.log("👤 Deployer:", await deployer.getAddress());
  console.log("💰 Saldo:", balanceEth, "ETH");
  
  // Usar gas price legacy (mais barato)
  const feeData = await ethers.provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || 0n;
  const legacyGasPrice = currentGasPrice * 10n / 100n; // 10% do gas price atual
  
  console.log("⛽ Gas Price atual:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("⛽ Gas Price legacy:", ethers.formatUnits(legacyGasPrice, "gwei"), "gwei");
  
  // Calcular custo com gas legacy
  const legacyGasLimit = 500000; // 500K gas (muito baixo)
  const estimatedCost = (BigInt(legacyGasLimit) * legacyGasPrice) / BigInt(10**18);
  const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
  
  console.log("💸 Custo estimado:", estimatedCostEth.toFixed(8), "ETH");
  
  if (parseFloat(balanceEth) < estimatedCostEth) {
    console.log("❌ Saldo insuficiente mesmo com gas legacy");
    console.log("📊 Diferença:", (estimatedCostEth - parseFloat(balanceEth)).toFixed(8), "ETH");
    return;
  }
  
  try {
    console.log("\n📝 DEPLOYANDO SMARTWALLET COM GAS LEGACY");
    console.log("==========================================");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    
    // Deploy com gas legacy (sem EIP-1559)
    const smartWallet = await SmartWallet.deploy({
      gasPrice: legacyGasPrice,
      gasLimit: legacyGasLimit,
      type: 0 // Tipo 0 = Legacy transaction
    });
    
    console.log("⏳ Aguardando confirmação (pode demorar muito)...");
    await smartWallet.waitForDeployment();
    
    const smartWalletAddress = await smartWallet.getAddress();
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // Verificar saldo após deploy
    const newBalance = await ethers.provider.getBalance(await deployer.getAddress());
    const newBalanceEth = ethers.formatEther(newBalance);
    const gasUsed = parseFloat(balanceEth) - parseFloat(newBalanceEth);
    
    console.log("💰 Saldo após deploy:", newBalanceEth, "ETH");
    console.log("⛽ Gas usado:", gasUsed.toFixed(8), "ETH");
    
    // Salvar resultado
    const result = {
      SmartWallet: smartWalletAddress,
      deploymentDate: new Date().toISOString(),
      network: "mainnet",
      deployer: await deployer.getAddress(),
      gasPrice: legacyGasPrice.toString(),
      gasLimit: legacyGasLimit,
      gasUsed: gasUsed.toString(),
      etherscanLink: `https://etherscan.io/address/${smartWalletAddress}`
    };
    
    const outputPath = path.join(__dirname, "..", "deployed-smartwallet-legacy.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log("\n🎉 DEPLOY CONCLUÍDO COM GAS LEGACY!");
    console.log("📄 Resultado salvo em: deployed-smartwallet-legacy.json");
    console.log("🔗 Etherscan:", result.etherscanLink);
    console.log("⛽ Gas usado:", gasUsed.toFixed(8), "ETH");
    
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
