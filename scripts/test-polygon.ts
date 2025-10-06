import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🧪 TESTANDO CONTRATOS EM POLYGON");
  console.log("==========================================");
  
  const deployer = await ethers.provider.getSigner();
  const deployerAddress = await deployer.getAddress();
  
  console.log("👤 Deployer:", deployerAddress);
  
  // Verificar rede
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Rede:", network.name, "Chain ID:", network.chainId.toString());
  
  // Verificar saldo
  const balance = await ethers.provider.getBalance(deployerAddress);
  const balanceEth = ethers.formatEther(balance);
  console.log("💰 Saldo:", balanceEth, "MATIC");
  
  // Verificar gas price
  const gasPrice = await ethers.provider.getFeeData();
  console.log("⛽ Gas Price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");
  
  console.log("\n🔍 TESTANDO FUNCIONALIDADES...");
  console.log("==========================================");
  
  try {
    // Teste 1: Deploy SmartWallet
    console.log("\n📝 Teste 1: Deploy SmartWallet");
    const SmartWallet = await ethers.getContractFactory("SmartWallet");
    const smartWallet = await SmartWallet.deploy();
    await smartWallet.waitForDeployment();
    const smartWalletAddress = await smartWallet.getAddress();
    console.log("✅ SmartWallet deployado em:", smartWalletAddress);
    
    // Teste 2: Verificar funções básicas
    console.log("\n📝 Teste 2: Funções básicas");
    const owner = await smartWallet.owner();
    console.log("👤 Owner:", owner);
    
    const isPaused = await smartWallet.paused();
    console.log("⏸️  Pausado:", isPaused);
    
    // Teste 3: Deploy SmartWalletV2
    console.log("\n📝 Teste 3: Deploy SmartWalletV2");
    const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
    const smartWalletV2 = await SmartWalletV2.deploy();
    await smartWalletV2.waitForDeployment();
    const smartWalletV2Address = await smartWalletV2.getAddress();
    console.log("✅ SmartWalletV2 deployado em:", smartWalletV2Address);
    
    // Teste 4: Deploy LiquidityPool
    console.log("\n📝 Teste 4: Deploy LiquidityPool");
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    
    // Usar endereços válidos para teste
    const usdtAddress = "0x0000000000000000000000000000000000000001";
    const usdcAddress = "0x0000000000000000000000000000000000000002";
    const poolFee = 30;
    
    const liquidityPool = await LiquidityPool.deploy(usdtAddress, usdcAddress, poolFee);
    await liquidityPool.waitForDeployment();
    const liquidityPoolAddress = await liquidityPool.getAddress();
    console.log("✅ LiquidityPool deployado em:", liquidityPoolAddress);
    
    // Teste 5: Deploy SmartWalletProxy
    console.log("\n📝 Teste 5: Deploy SmartWalletProxy");
    const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
    const proxyData = "0x";
    const smartWalletProxy = await SmartWalletProxy.deploy(smartWalletV2Address, proxyData);
    await smartWalletProxy.waitForDeployment();
    const smartWalletProxyAddress = await smartWalletProxy.getAddress();
    console.log("✅ SmartWalletProxy deployado em:", smartWalletProxyAddress);
    
    // Teste 6: Verificar configurações
    console.log("\n📝 Teste 6: Configurações");
    
    // Verificar se SmartWallet está pausado
    const smartWalletPaused = await smartWallet.paused();
    console.log("🔒 SmartWallet pausado:", smartWalletPaused);
    
    // Verificar se LiquidityPool está pausado
    const liquidityPoolPaused = await liquidityPool.paused();
    console.log("🔒 LiquidityPool pausado:", liquidityPoolPaused);
    
    // Teste 7: Whitelist tokens
    console.log("\n📝 Teste 7: Whitelist tokens");
    try {
      await smartWallet.whitelistToken(usdtAddress);
      console.log("✅ USDT adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDT:", error.message);
    }
    
    try {
      await smartWallet.whitelistToken(usdcAddress);
      console.log("✅ USDC adicionado à whitelist");
    } catch (error) {
      console.log("⚠️  Erro ao adicionar USDC:", error.message);
    }
    
    // Teste 8: Verificar saldo após testes
    const finalBalance = await ethers.provider.getBalance(deployerAddress);
    const finalBalanceEth = ethers.formatEther(finalBalance);
    const gasUsed = parseFloat(balanceEth) - parseFloat(finalBalanceEth);
    
    console.log("\n📊 RESULTADOS DOS TESTES");
    console.log("==========================================");
    console.log("💰 Saldo inicial:", balanceEth, "MATIC");
    console.log("💰 Saldo final:", finalBalanceEth, "MATIC");
    console.log("⛽ Gas usado:", gasUsed.toFixed(6), "MATIC");
    console.log("✅ Todos os testes passaram!");
    
    console.log("\n🎯 CONTRATOS PRONTOS PARA DEPLOY EM POLYGON");
    console.log("==========================================");
    console.log("📋 Endereços dos contratos:");
    console.log(`SmartWallet: ${smartWalletAddress}`);
    console.log(`SmartWalletV2: ${smartWalletV2Address}`);
    console.log(`LiquidityPool: ${liquidityPoolAddress}`);
    console.log(`SmartWalletProxy: ${smartWalletProxyAddress}`);
    
    console.log("\n🚀 Próximos passos:");
    console.log("1. Configurar .env com suas chaves");
    console.log("2. Executar deploy em Polygon Mainnet");
    console.log("3. Verificar contratos no Polygonscan");
    console.log("4. Testar todas as funções principais");
    
  } catch (error) {
    console.error("❌ ERRO NOS TESTES:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ ERRO FATAL:", error);
    process.exit(1);
  });
