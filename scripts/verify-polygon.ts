import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 VERIFICANDO CONTRATOS NO POLYGONSCAN");
  console.log("==========================================");
  
  // Carregar endereços dos contratos deployados
  const contractsPath = path.join(__dirname, "..", "deployed-contracts-polygon.json");
  
  if (!fs.existsSync(contractsPath)) {
    console.error("❌ Arquivo deployed-contracts-polygon.json não encontrado!");
    console.log("💡 Execute primeiro: npx hardhat run scripts/deploy-polygon.ts --network polygon");
    process.exit(1);
  }
  
  const contracts = JSON.parse(fs.readFileSync(contractsPath, "utf8"));
  
  console.log("📋 Contratos encontrados:");
  console.log(`SmartWallet: ${contracts.SmartWallet}`);
  console.log(`SmartWalletV2: ${contracts.SmartWalletV2}`);
  console.log(`LiquidityPool: ${contracts.LiquidityPool}`);
  console.log(`SmartWalletProxy: ${contracts.SmartWalletProxy}`);
  
  console.log("\n🔍 INICIANDO VERIFICAÇÃO...");
  console.log("==========================================");
  
  try {
    // Verificar SmartWallet
    console.log("\n📝 Verificando SmartWallet...");
    try {
      await ethers.run("verify:verify", {
        address: contracts.SmartWallet,
        constructorArguments: [],
      });
      console.log("✅ SmartWallet verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar SmartWallet:", error.message);
    }
    
    // Verificar SmartWalletV2
    console.log("\n📝 Verificando SmartWalletV2...");
    try {
      await ethers.run("verify:verify", {
        address: contracts.SmartWalletV2,
        constructorArguments: [],
      });
      console.log("✅ SmartWalletV2 verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar SmartWalletV2:", error.message);
    }
    
    // Verificar LiquidityPool
    console.log("\n📝 Verificando LiquidityPool...");
    try {
      // Usar os mesmos argumentos do deploy
      const usdtAddress = "0xc2132D5D0EBb5cC0fCb4c4C2C0C0C0C0C0C0C0C0";
      const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
      const poolFee = 30;
      
      await ethers.run("verify:verify", {
        address: contracts.LiquidityPool,
        constructorArguments: [usdtAddress, usdcAddress, poolFee],
      });
      console.log("✅ LiquidityPool verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar LiquidityPool:", error.message);
    }
    
    // Verificar SmartWalletProxy
    console.log("\n📝 Verificando SmartWalletProxy...");
    try {
      const proxyData = "0x";
      await ethers.run("verify:verify", {
        address: contracts.SmartWalletProxy,
        constructorArguments: [contracts.SmartWalletV2, proxyData],
      });
      console.log("✅ SmartWalletProxy verificado com sucesso!");
    } catch (error) {
      console.log("⚠️  Erro ao verificar SmartWalletProxy:", error.message);
    }
    
    console.log("\n🎉 VERIFICAÇÃO CONCLUÍDA!");
    console.log("==========================================");
    console.log("🔗 Links dos contratos no Polygonscan:");
    console.log(`SmartWallet: ${contracts.polygonscanLinks.SmartWallet}`);
    console.log(`SmartWalletV2: ${contracts.polygonscanLinks.SmartWalletV2}`);
    console.log(`LiquidityPool: ${contracts.polygonscanLinks.LiquidityPool}`);
    console.log(`SmartWalletProxy: ${contracts.polygonscanLinks.SmartWalletProxy}`);
    
    console.log("\n📋 Próximos passos:");
    console.log("1. Verificar cada contrato no Polygonscan");
    console.log("2. Testar todas as funções principais");
    console.log("3. Configurar monitoramento");
    console.log("4. Documentar endereços dos contratos");
    
  } catch (error) {
    console.error("❌ ERRO NA VERIFICAÇÃO:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error);
    process.exit(1);
  });
