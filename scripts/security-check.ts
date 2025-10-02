import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SmartWalletV2 } from "../typechain-types";

async function main() {
  console.log("Running security checks...");

  const [owner, user1, attacker] = await ethers.getSigners();
  let smartWallet: SmartWalletV2;

  // 1. Verificação de Roles
  console.log("\n1. Verificando roles...");
  try {
    const roles = [
      "DEFAULT_ADMIN_ROLE",
      "ADMIN_ROLE",
      "GUARDIAN_ROLE",
      "OPERATOR_ROLE",
      "EMERGENCY_ROLE"
    ];

    for (const role of roles) {
      const hasRole = await smartWallet.hasRole(
        await smartWallet[role](),
        owner.address
      );
      console.log(`Role ${role}: ${hasRole ? "OK" : "FAIL"}`);
    }
  } catch (error) {
    console.error("Erro na verificação de roles:", error);
  }

  // 2. Verificação de Limites
  console.log("\n2. Verificando limites...");
  try {
    const config = await smartWallet.getSecurityConfig(user1.address);
    console.log("Limites configurados:", {
      minGuardians: config.minGuardians.toString(),
      maxGuardians: config.maxGuardians.toString(),
      recoveryDelay: config.recoveryDelay.toString(),
      largeTxDelay: config.largeTxDelay.toString(),
      rateLimitPeriod: config.rateLimitPeriod.toString(),
      maxTxPerPeriod: config.maxTxPerPeriod.toString(),
      largeTxThreshold: ethers.utils.formatEther(config.largeTxThreshold),
      minGuardianApprovals: config.minGuardianApprovals.toString()
    });
  } catch (error) {
    console.error("Erro na verificação de limites:", error);
  }

  // 3. Teste de Reentrância
  console.log("\n3. Testando proteção contra reentrância...");
  try {
    const AttackerContract = await ethers.getContractFactory("ReentrancyAttacker");
    const attackerContract = await AttackerContract.deploy(smartWallet.address);
    
    await expect(attackerContract.attack()).to.be.revertedWith(
      "ReentrancyGuard: reentrant call"
    );
    console.log("Proteção contra reentrância: OK");
  } catch (error) {
    console.error("Erro no teste de reentrância:", error);
  }

  // 4. Verificação de Pausabilidade
  console.log("\n4. Verificando pausabilidade...");
  try {
    const isPaused = await smartWallet.paused();
    console.log("Contrato pausado:", isPaused);

    // Testa pause/unpause
    await smartWallet.pause();
    console.log("Pause: OK");
    await smartWallet.unpause();
    console.log("Unpause: OK");
  } catch (error) {
    console.error("Erro na verificação de pausabilidade:", error);
  }

  // 5. Teste de Limites de Gás
  console.log("\n5. Verificando limites de gás...");
  try {
    const tx = await smartWallet.estimateGas.createWallet(
      ethers.utils.parseEther("1"),
      1
    );
    console.log("Gas estimado para createWallet:", tx.toString());
    if (tx.gt(ethers.BigNumber.from("300000"))) {
      console.warn("AVISO: Alto consumo de gás");
    }
  } catch (error) {
    console.error("Erro na verificação de gás:", error);
  }

  // 6. Verificação de Eventos
  console.log("\n6. Verificando eventos...");
  try {
    const filter = smartWallet.filters.WalletCreated();
    const events = await smartWallet.queryFilter(filter);
    console.log("Número de carteiras criadas:", events.length);
  } catch (error) {
    console.error("Erro na verificação de eventos:", error);
  }

  // 7. Teste de Acesso não Autorizado
  console.log("\n7. Testando acessos não autorizados...");
  try {
    await expect(
      smartWallet.connect(attacker).pause()
    ).to.be.revertedWith("AccessControl");
    console.log("Proteção de acesso: OK");
  } catch (error) {
    console.error("Erro no teste de acesso:", error);
  }

  // 8. Verificação de Blacklist
  console.log("\n8. Verificando blacklist...");
  try {
    const isBlacklisted = await smartWallet.blacklistedAddresses(
      attacker.address
    );
    console.log("Endereço na blacklist:", isBlacklisted);
  } catch (error) {
    console.error("Erro na verificação de blacklist:", error);
  }

  // 9. Teste de Rate Limiting
  console.log("\n9. Verificando rate limiting...");
  try {
    const rateLimitInfo = await smartWallet.getRateLimitInfo(user1.address);
    console.log("Rate limit info:", {
      txCount: rateLimitInfo.txCount.toString(),
      lastTxTimestamp: new Date(
        rateLimitInfo.lastTxTimestamp.toNumber() * 1000
      ).toISOString()
    });
  } catch (error) {
    console.error("Erro na verificação de rate limiting:", error);
  }

  // 10. Verificação de Upgrades
  console.log("\n10. Verificando capacidade de upgrade...");
  try {
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
      smartWallet.address
    );
    console.log("Endereço da implementação:", implementationAddress);
  } catch (error) {
    console.error("Erro na verificação de upgrade:", error);
  }

  console.log("\nVerificação de segurança concluída!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
