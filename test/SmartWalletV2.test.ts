import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SmartWalletV2, IERC20 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SmartWalletV2", () => {
  let smartWallet: SmartWalletV2;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let guardian1: SignerWithAddress;
  let guardian2: SignerWithAddress;
  let guardian3: SignerWithAddress;
  let attacker: SignerWithAddress;
  let mockToken: IERC20;

  const DAILY_LIMIT = ethers.utils.parseEther("10");
  const LARGE_AMOUNT = ethers.utils.parseEther("20");
  const SMALL_AMOUNT = ethers.utils.parseEther("1");

  beforeEach(async () => {
    // Deploy contracts
    [owner, user1, user2, guardian1, guardian2, guardian3, attacker] = await ethers.getSigners();

    const SmartWalletV2Factory = await ethers.getContractFactory("SmartWalletV2");
    smartWallet = await upgrades.deployProxy(SmartWalletV2Factory, [], {
      initializer: "initialize",
      kind: "uups"
    });
    await smartWallet.deployed();

    // Deploy mock token
    const MockToken = await ethers.getContractFactory("MockERC20");
    mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.deployed();

    // Unpause contract
    await smartWallet.unpause();

    // Whitelist token
    await smartWallet.whitelistToken(mockToken.address);
  });

  describe("Initialization", () => {
    it("Should initialize with correct roles", async () => {
      expect(await smartWallet.hasRole(await smartWallet.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await smartWallet.hasRole(await smartWallet.ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await smartWallet.hasRole(await smartWallet.EMERGENCY_ROLE(), owner.address)).to.be.true;
    });

    it("Should not allow reinitialization", async () => {
      await expect(smartWallet.initialize()).to.be.revertedWith("Initializable: contract is already initialized");
    });
  });

  describe("Wallet Creation", () => {
    it("Should create wallet with correct parameters", async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
      const wallet = await smartWallet.getWalletInfo(user1.address);
      expect(wallet.exists).to.be.true;
      expect(wallet.owner).to.equal(user1.address);
      expect(wallet.dailyLimit).to.equal(DAILY_LIMIT);
    });

    it("Should not allow duplicate wallet creation", async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
      await expect(
        smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1)
      ).to.be.revertedWith("Wallet already exists");
    });

    it("Should enforce valid security levels", async () => {
      await expect(
        smartWallet.connect(user1).createWallet(DAILY_LIMIT, 0)
      ).to.be.revertedWith("Invalid security level");
      await expect(
        smartWallet.connect(user1).createWallet(DAILY_LIMIT, 4)
      ).to.be.revertedWith("Invalid security level");
    });
  });

  describe("Guardian Management", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
    });

    it("Should add guardian successfully", async () => {
      await smartWallet.connect(user1).addGuardian(guardian1.address);
      expect(await smartWallet.isGuardian(user1.address, guardian1.address)).to.be.true;
    });

    it("Should not exceed max guardians", async () => {
      for (let i = 0; i < 5; i++) {
        const guardian = ethers.Wallet.createRandom();
        await smartWallet.connect(user1).addGuardian(guardian.address);
      }
      await expect(
        smartWallet.connect(user1).addGuardian(attacker.address)
      ).to.be.revertedWith("Max guardians reached");
    });

    it("Should not allow duplicate guardians", async () => {
      await smartWallet.connect(user1).addGuardian(guardian1.address);
      await expect(
        smartWallet.connect(user1).addGuardian(guardian1.address)
      ).to.be.revertedWith("Guardian already exists");
    });

    it("Should not allow blacklisted guardians", async () => {
      await smartWallet.blacklistAddress(attacker.address);
      await expect(
        smartWallet.connect(user1).addGuardian(attacker.address)
      ).to.be.revertedWith("Guardian is blacklisted");
    });
  });

  describe("Transaction Limits", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
      await mockToken.mint(user1.address, ethers.utils.parseEther("100"));
      await mockToken.connect(user1).approve(smartWallet.address, ethers.constants.MaxUint256);
    });

    it("Should enforce daily limits", async () => {
      const signature = await signTransaction(user1, mockToken.address, user2.address, DAILY_LIMIT);
      await smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, DAILY_LIMIT, signature);
      
      const newSignature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, newSignature)
      ).to.be.revertedWith("Transaction exceeds limits");
    });

    it("Should reset daily limits after 24 hours", async () => {
      const signature1 = await signTransaction(user1, mockToken.address, user2.address, DAILY_LIMIT);
      await smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, DAILY_LIMIT, signature1);
      
      await time.increase(24 * 60 * 60 + 1); // 24 hours + 1 second

      const signature2 = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature2)
      ).to.not.be.reverted;
    });

    it("Should queue large transactions", async () => {
      const signature = await signTransaction(user1, mockToken.address, user2.address, LARGE_AMOUNT);
      await smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, LARGE_AMOUNT, signature);
      
      const txHash = ethers.utils.solidityKeccak256(
        ["address", "address", "uint256", "address", "uint256"],
        [user1.address, user2.address, LARGE_AMOUNT, mockToken.address, await time.latest()]
      );

      const queuedTx = await smartWallet.getQueuedTransaction(txHash);
      expect(queuedTx.from).to.equal(user1.address);
      expect(queuedTx.amount).to.equal(LARGE_AMOUNT);
      expect(queuedTx.executed).to.be.false;
    });
  });

  describe("Recovery Process", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
      await smartWallet.connect(user1).addGuardian(guardian1.address);
      await smartWallet.connect(user1).addGuardian(guardian2.address);
      await smartWallet.connect(user1).addGuardian(guardian3.address);
    });

    it("Should initiate recovery successfully", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(user1.address, user2.address);
      const recovery = await smartWallet.getRecoveryInfo(user1.address);
      expect(recovery.newOwner).to.equal(user2.address);
      expect(recovery.approvalsCount).to.equal(1);
    });

    it("Should require minimum guardian approvals", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(user1.address, user2.address);
      await smartWallet.connect(guardian2).approveRecovery(user1.address);
      
      const recovery = await smartWallet.getRecoveryInfo(user1.address);
      expect(recovery.executed).to.be.false;

      await smartWallet.connect(guardian3).approveRecovery(user1.address);
      const updatedRecovery = await smartWallet.getRecoveryInfo(user1.address);
      expect(updatedRecovery.executed).to.be.true;
    });

    it("Should not allow recovery after expiration", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(user1.address, user2.address);
      await time.increase(24 * 60 * 60 + 1); // 24 hours + 1 second

      await expect(
        smartWallet.connect(guardian2).approveRecovery(user1.address)
      ).to.be.revertedWith("Recovery expired");
    });

    it("Should not allow duplicate approvals", async () => {
      await smartWallet.connect(guardian1).initiateRecovery(user1.address, user2.address);
      await expect(
        smartWallet.connect(guardian1).approveRecovery(user1.address)
      ).to.be.revertedWith("Already approved");
    });
  });

  describe("Security Levels", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
    });

    it("Should enforce stricter limits for higher security levels", async () => {
      await smartWallet.connect(user1).updateSecurityLevel(3);
      const config = await smartWallet.getSecurityConfig(user1.address);
      expect(config.maxTxPerPeriod).to.equal(3);
      expect(config.largeTxThreshold).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should not allow decreasing security level", async () => {
      await smartWallet.connect(user1).updateSecurityLevel(3);
      await expect(
        smartWallet.connect(user1).updateSecurityLevel(2)
      ).to.be.revertedWith("Cannot decrease security level");
    });
  });

  describe("Emergency Controls", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
    });

    it("Should allow emergency pause of functions", async () => {
      const functionSelector = smartWallet.interface.getSighash("transferTokens");
      await smartWallet.connect(owner).pauseFunction(user1.address, functionSelector);
      
      const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature)
      ).to.be.revertedWith("Function is paused");
    });

    it("Should allow emergency wallet lock", async () => {
      await smartWallet.connect(owner).lockWallet(user1.address);
      
      const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature)
      ).to.be.revertedWith("Wallet is locked");
    });

    it("Should only allow emergency role to execute emergency actions", async () => {
      await expect(
        smartWallet.connect(attacker).lockWallet(user1.address)
      ).to.be.revertedWith("AccessControl");
    });
  });

  describe("Rate Limiting", () => {
    beforeEach(async () => {
      await smartWallet.connect(user1).createWallet(DAILY_LIMIT, 1);
      await mockToken.mint(user1.address, ethers.utils.parseEther("100"));
      await mockToken.connect(user1).approve(smartWallet.address, ethers.constants.MaxUint256);
    });

    it("Should enforce transaction rate limits", async () => {
      for (let i = 0; i < 10; i++) {
        const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
        await smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature);
      }

      const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature)
      ).to.be.revertedWith("Rate limit exceeded");
    });

    it("Should reset rate limits after period", async () => {
      for (let i = 0; i < 10; i++) {
        const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
        await smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature);
      }

      await time.increase(3600 + 1); // 1 hour + 1 second

      const signature = await signTransaction(user1, mockToken.address, user2.address, SMALL_AMOUNT);
      await expect(
        smartWallet.connect(user1).transferTokens(mockToken.address, user2.address, SMALL_AMOUNT, signature)
      ).to.not.be.reverted;
    });
  });

  // Funções auxiliares

  async function signTransaction(
    signer: SignerWithAddress,
    token: string,
    to: string,
    amount: any
  ): Promise<string> {
    const wallet = await smartWallet.getWalletInfo(signer.address);
    const nonce = await smartWallet.getNonce(signer.address);

    const hash = ethers.utils.solidityKeccak256(
      ["address", "address", "address", "uint256", "uint256"],
      [signer.address, token, to, amount, nonce]
    );

    const signature = await signer.signMessage(ethers.utils.arrayify(hash));
    return signature;
  }
});
