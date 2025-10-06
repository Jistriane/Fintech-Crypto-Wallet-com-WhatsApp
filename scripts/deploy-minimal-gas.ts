import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 DEPLOY COM GAS MÍNIMO");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await deployer.getAddress());
  const balanceEth = ethers.formatEther(balance);
  
  console.log("👤 Deployer:", await deployer.getAddress());
  console.log("💰 Saldo:", balanceEth, "ETH");
  
  // Usar gas price extremamente baixo
  const feeData = await ethers.provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || 0n;
  const minimalGasPrice = currentGasPrice * 20n / 100n; // 20% do gas price atual
  
  console.log("⛽ Gas Price atual:", ethers.formatUnits(currentGasPrice, "gwei"), "gwei");
  console.log("⛽ Gas Price mínimo:", ethers.formatUnits(minimalGasPrice, "gwei"), "gwei");
  
  // Calcular custo com gas mínimo
  const minimalGasLimit = 1000000; // 1M gas
  const estimatedCost = (BigInt(minimalGasLimit) * minimalGasPrice) / BigInt(10**18);
  const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
  
  console.log("💸 Custo estimado:", estimatedCostEth.toFixed(8), "ETH");
  
  if (parseFloat(balanceEth) < estimatedCostEth) {
    console.log("❌ Saldo insuficiente mesmo com gas mínimo");
    console.log("📊 Diferença:", (estimatedCostEth - parseFloat(balanceEth)).toFixed(8), "ETH");
    return;
  }
  
  try {
    console.log("\n📝 DEPLOYANDO SMARTWALLET COM GAS MÍNIMO");
    console.log("==========================================");
    
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    
    // Deploy com configurações mínimas
    const smartWallet = await SmartWallet.deploy({
      gasPrice: minimalGasPrice,
      gasLimit: minimalGasLimit
    });
    
    console.log("⏳ Aguardando confirmação (pode demorar)...");
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
      gasPrice: minimalGasPrice.toString(),
      gasLimit: minimalGasLimit,
      gasUsed: gasUsed.toString(),
      etherscanLink: `https://etherscan.io/address/${smartWalletAddress}`
    };
    
    const outputPath = path.join(__dirname, "..", "deployed-smartwallet-minimal.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    
    console.log("\n🎉 DEPLOY CONCLUÍDO COM GAS MÍNIMO!");
    console.log("📄 Resultado salvo em: deployed-smartwallet-minimal.json");
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
