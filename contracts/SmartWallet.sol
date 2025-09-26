// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SmartWallet
 * @dev Contrato principal da carteira inteligente
 */
contract SmartWallet is Ownable, ReentrancyGuard, Pausable {
    // Eventos
    event WalletCreated(address indexed owner, address wallet);
    event TokensTransferred(address indexed from, address indexed to, address token, uint256 amount);
    event NativeTokenTransferred(address indexed from, address indexed to, uint256 amount);
    event GuardianAdded(address indexed wallet, address indexed guardian);
    event GuardianRemoved(address indexed wallet, address indexed guardian);
    event LimitsUpdated(address indexed wallet, uint256 dailyLimit, uint256 monthlyLimit);

    // Estruturas
    struct WalletInfo {
        bool exists;
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastDayReset;
        uint256 lastMonthReset;
        mapping(address => bool) guardians;
        uint256 guardiansCount;
    }

    // Estado
    mapping(address => WalletInfo) public wallets;
    mapping(address => bool) public whitelistedTokens;
    uint256 public constant MAX_GUARDIANS = 3;

    // Modificadores
    modifier onlyWalletOwner(address wallet) {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(msg.sender == wallet, "Not wallet owner");
        _;
    }

    modifier withinLimits(address wallet, uint256 amount) {
        require(checkLimits(wallet, amount), "Transaction exceeds limits");
        _;
    }

    /**
     * @dev Construtor
     */
    constructor() {
        _pause(); // Inicialmente pausado para configuração
    }

    /**
     * @dev Cria uma nova carteira
     * @param initialLimit Limite diário inicial
     */
    function createWallet(uint256 initialLimit) external {
        require(!wallets[msg.sender].exists, "Wallet already exists");
        
        WalletInfo storage wallet = wallets[msg.sender];
        wallet.exists = true;
        wallet.dailyLimit = initialLimit;
        wallet.monthlyLimit = initialLimit * 30;
        wallet.lastDayReset = block.timestamp;
        wallet.lastMonthReset = block.timestamp;

        emit WalletCreated(msg.sender, msg.sender);
    }

    /**
     * @dev Transfere tokens ERC20
     * @param token Endereço do token
     * @param to Destinatário
     * @param amount Quantidade
     */
    function transferTokens(
        address token,
        address to,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyWalletOwner(msg.sender) withinLimits(msg.sender, amount) {
        require(whitelistedTokens[token], "Token not whitelisted");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        IERC20(token).transferFrom(msg.sender, to, amount);
        updateSpentLimits(msg.sender, amount);

        emit TokensTransferred(msg.sender, to, token, amount);
    }

    /**
     * @dev Transfere tokens nativos (ETH/MATIC/BNB)
     * @param to Destinatário
     */
    function transferNative(
        address payable to
    ) external payable nonReentrant whenNotPaused onlyWalletOwner(msg.sender) withinLimits(msg.sender, msg.value) {
        require(to != address(0), "Invalid recipient");
        require(msg.value > 0, "Invalid amount");

        to.transfer(msg.value);
        updateSpentLimits(msg.sender, msg.value);

        emit NativeTokenTransferred(msg.sender, to, msg.value);
    }

    /**
     * @dev Adiciona um guardião
     * @param guardian Endereço do guardião
     */
    function addGuardian(address guardian) external onlyWalletOwner(msg.sender) {
        require(guardian != address(0), "Invalid guardian");
        require(!wallets[msg.sender].guardians[guardian], "Guardian already exists");
        require(wallets[msg.sender].guardiansCount < MAX_GUARDIANS, "Max guardians reached");

        wallets[msg.sender].guardians[guardian] = true;
        wallets[msg.sender].guardiansCount++;

        emit GuardianAdded(msg.sender, guardian);
    }

    /**
     * @dev Remove um guardião
     * @param guardian Endereço do guardião
     */
    function removeGuardian(address guardian) external onlyWalletOwner(msg.sender) {
        require(wallets[msg.sender].guardians[guardian], "Guardian does not exist");

        wallets[msg.sender].guardians[guardian] = false;
        wallets[msg.sender].guardiansCount--;

        emit GuardianRemoved(msg.sender, guardian);
    }

    /**
     * @dev Atualiza limites da carteira
     * @param wallet Endereço da carteira
     * @param newDailyLimit Novo limite diário
     * @param newMonthlyLimit Novo limite mensal
     */
    function updateLimits(
        address wallet,
        uint256 newDailyLimit,
        uint256 newMonthlyLimit
    ) external onlyOwner {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(newMonthlyLimit >= newDailyLimit * 30, "Invalid monthly limit");

        wallets[wallet].dailyLimit = newDailyLimit;
        wallets[wallet].monthlyLimit = newMonthlyLimit;

        emit LimitsUpdated(wallet, newDailyLimit, newMonthlyLimit);
    }

    /**
     * @dev Verifica se uma transação está dentro dos limites
     * @param wallet Endereço da carteira
     * @param amount Valor da transação
     */
    function checkLimits(address wallet, uint256 amount) internal returns (bool) {
        WalletInfo storage info = wallets[wallet];

        // Reset diário
        if (block.timestamp >= info.lastDayReset + 1 days) {
            info.dailySpent = 0;
            info.lastDayReset = block.timestamp;
        }

        // Reset mensal
        if (block.timestamp >= info.lastMonthReset + 30 days) {
            info.monthlySpent = 0;
            info.lastMonthReset = block.timestamp;
        }

        return (
            info.dailySpent + amount <= info.dailyLimit &&
            info.monthlySpent + amount <= info.monthlyLimit
        );
    }

    /**
     * @dev Atualiza os gastos após uma transação
     * @param wallet Endereço da carteira
     * @param amount Valor da transação
     */
    function updateSpentLimits(address wallet, uint256 amount) internal {
        WalletInfo storage info = wallets[wallet];
        info.dailySpent += amount;
        info.monthlySpent += amount;
    }

    /**
     * @dev Adiciona token à whitelist
     * @param token Endereço do token
     */
    function whitelistToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        whitelistedTokens[token] = true;
    }

    /**
     * @dev Remove token da whitelist
     * @param token Endereço do token
     */
    function removeTokenFromWhitelist(address token) external onlyOwner {
        require(token != address(0), "Invalid token");
        whitelistedTokens[token] = false;
    }

    /**
     * @dev Pausa o contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
