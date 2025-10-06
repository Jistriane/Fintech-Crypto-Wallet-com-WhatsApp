import { ethers } from "hardhat";

async function main() {
  console.log("🔍 VERIFICANDO SALDO E TRANSAÇÕES");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const address = await deployer.getAddress();
  
  console.log("👤 Endereço:", address);
  
  // Verificar saldo atual
  const balance = await ethers.provider.getBalance(address);
  const balanceEth = ethers.formatEther(balance);
  console.log("💰 Saldo atual:", balanceEth, "ETH");
  
  // Verificar transações recentes
  console.log("\n📋 TRANSAÇÕES RECENTES:");
  console.log("==========================================");
  
  try {
    // Buscar transações do endereço
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log("📦 Block atual:", blockNumber);
    
    // Verificar se há transações pendentes
    const nonce = await ethers.provider.getTransactionCount(address);
    console.log("🔢 Nonce atual:", nonce);
    
    // Verificar gas price atual
    const feeData = await ethers.provider.getFeeData();
    console.log("⛽ Gas Price:", feeData.gasPrice?.toString(), "wei");
    console.log("⛽ Gas Price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
    
    // Calcular custo estimado
    const estimatedGas = 2000000; // 2M gas
    const estimatedCost = (BigInt(estimatedGas) * (feeData.gasPrice || 0n)) / BigInt(10**18);
    const estimatedCostEth = parseFloat(ethers.formatEther(estimatedCost));
    
    console.log("\n💸 CUSTO ESTIMADO:");
    console.log("==========================================");
    console.log("Gas estimado:", estimatedGas);
    console.log("Custo estimado:", estimatedCostEth.toFixed(6), "ETH");
    console.log("Saldo disponível:", balanceEth, "ETH");
    
    if (parseFloat(balanceEth) >= estimatedCostEth) {
      console.log("✅ Saldo suficiente para deploy!");
    } else {
      console.log("❌ Saldo insuficiente para deploy");
      console.log("📊 Diferença necessária:", (estimatedCostEth - parseFloat(balanceEth)).toFixed(6), "ETH");
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar transações:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });
