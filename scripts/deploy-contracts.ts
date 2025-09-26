import { ethers } from "hardhat";

async function main() {
  console.log("Iniciando deploy dos contratos...");

  // Deploy SmartWallet
  const SmartWallet = await ethers.getContractFactory("SmartWallet");
  const smartWallet = await SmartWallet.deploy();
  await smartWallet.deployed();
  console.log(`SmartWallet implantado em: ${smartWallet.address}`);

  // Deploy LiquidityPool para MATIC/USDC
  const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC na Polygon
  const maticAddress = "0x0000000000000000000000000000000000001010"; // MATIC na Polygon
  const poolFee = 30; // 0.3%

  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(maticAddress, usdcAddress, poolFee);
  await liquidityPool.deployed();
  console.log(`LiquidityPool MATIC/USDC implantada em: ${liquidityPool.address}`);

  // Configurar SmartWallet
  await smartWallet.whitelistToken(usdcAddress);
  console.log("USDC adicionado à whitelist");

  await smartWallet.whitelistToken(maticAddress);
  console.log("MATIC adicionado à whitelist");

  // Despausar contratos
  await smartWallet.unpause();
  console.log("SmartWallet despausado");

  console.log("\nDeploy concluído com sucesso!");
  console.log("\nEndereços dos contratos:");
  console.log("-------------------------");
  console.log(`SmartWallet: ${smartWallet.address}`);
  console.log(`LiquidityPool MATIC/USDC: ${liquidityPool.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
