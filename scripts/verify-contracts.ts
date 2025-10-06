import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

interface ContractInfo {
  name: string;
  address: string;
  constructorArgs: any[];
}

async function main() {
  console.log("🔍 VERIFICANDO CONTRATOS NO ETHERSCAN");
  console.log("==========================================");
  
  // Carregar endereços dos contratos deployados
  const contractsPath = path.join(__dirname, "..", "deployed-contracts-mainnet.json");
  
  if (!fs.existsSync(contractsPath)) {
    console.error("❌ Arquivo deployed-contracts-mainnet.json não encontrado!");
    console.log("Execute o deploy primeiro: npx hardhat run scripts/deploy-mainnet-secure.ts --network mainnet");
    process.exit(1);
  }
  
  const deployedContracts = JSON.parse(fs.readFileSync(contractsPath, "utf8"));
  
  const contracts: ContractInfo[] = [
    {
      name: "SmartWallet",
      address: deployedContracts.SmartWallet,
      constructorArgs: []
    },
    {
      name: "SmartWalletV2", 
      address: deployedContracts.SmartWalletV2,
      constructorArgs: []
    },
    {
      name: "LiquidityPool",
      address: deployedContracts.LiquidityPool,
      constructorArgs: []
    },
    {
      name: "SmartWalletProxy",
      address: deployedContracts.SmartWalletProxy,
      constructorArgs: []
    }
  ];
  
  console.log("📋 Contratos encontrados:");
  contracts.forEach(contract => {
    console.log(`  - ${contract.name}: ${contract.address}`);
  });
  console.log("");
  
  // Verificar cada contrato
  for (const contract of contracts) {
    console.log(`🔍 Verificando ${contract.name}...`);
    
    try {
      await ethers.run("verify:verify", {
        address: contract.address,
        constructorArguments: contract.constructorArgs,
      });
      console.log(`✅ ${contract.name} verificado com sucesso!`);
      console.log(`🔗 Link: https://etherscan.io/address/${contract.address}`);
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log(`✅ ${contract.name} já estava verificado!`);
      } else {
        console.log(`❌ Erro ao verificar ${contract.name}:`, error.message);
      }
    }
    
    console.log("");
  }
  
  console.log("🎉 Verificação concluída!");
  console.log("📋 Resumo dos contratos:");
  console.log("==========================================");
  
  contracts.forEach(contract => {
    console.log(`${contract.name}:`);
    console.log(`  Endereço: ${contract.address}`);
    console.log(`  Etherscan: https://etherscan.io/address/${contract.address}`);
    console.log("");
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro na verificação:", error);
    process.exit(1);
  });