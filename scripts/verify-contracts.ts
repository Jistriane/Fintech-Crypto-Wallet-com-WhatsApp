import { run } from "hardhat";

async function main() {
  const smartWalletAddress = "ENDERECO_SMART_WALLET";
  const liquidityPoolAddress = "ENDERECO_LIQUIDITY_POOL";
  const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC na Polygon
  const maticAddress = "0x0000000000000000000000000000000000001010"; // MATIC na Polygon
  const poolFee = 30; // 0.3%

  console.log("Iniciando verificação dos contratos...");

  // Verificar SmartWallet
  console.log("\nVerificando SmartWallet...");
  try {
    await run("verify:verify", {
      address: smartWalletAddress,
      constructorArguments: []
    });
    console.log("SmartWallet verificado com sucesso!");
  } catch (error) {
    console.error("Erro ao verificar SmartWallet:", error);
  }

  // Verificar LiquidityPool
  console.log("\nVerificando LiquidityPool...");
  try {
    await run("verify:verify", {
      address: liquidityPoolAddress,
      constructorArguments: [maticAddress, usdcAddress, poolFee]
    });
    console.log("LiquidityPool verificado com sucesso!");
  } catch (error) {
    console.error("Erro ao verificar LiquidityPool:", error);
  }

  console.log("\nProcesso de verificação concluído!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
