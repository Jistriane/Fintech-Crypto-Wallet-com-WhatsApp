// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

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
    mapping(bytes32 => bool) public usedSignatures; // Para prevenir replay attacks
    uint256 public constant MAX_GUARDIANS = 3;
    uint256 public constant RATE_LIMIT_PERIOD = 1 minutes; // Rate limiting
    uint256 public constant MAX_TRANSACTIONS_PER_PERIOD = 10;

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

    modifier rateLimited(address wallet) {
        require(checkRateLimit(wallet), "Rate limit exceeded");
        _;
    }

    modifier notContract() {
        require(msg.sender == tx.origin, "Contracts not allowed");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        require(addr != address(this), "Cannot use contract address");
        _;
    }

    /**
     * @dev Construtor
     */
    constructor() Ownable(msg.sender) {
        _pause(); // Inicialmente pausado para configuração
    }

    /**
     * @dev Cria uma nova carteira com verificações de segurança
     * @param initialLimit Limite diário inicial
     */
    function createWallet(uint256 initialLimit) external notContract {
        require(!wallets[msg.sender].exists, "Wallet already exists");
        require(initialLimit > 0, "Invalid initial limit");
        
        WalletInfo storage wallet = wallets[msg.sender];
        wallet.exists = true;
        wallet.dailyLimit = initialLimit;
        wallet.monthlyLimit = initialLimit * 30;
        wallet.lastDayReset = block.timestamp;
        wallet.lastMonthReset = block.timestamp;

        emit WalletCreated(msg.sender, msg.sender);
    }

    /**
     * @dev Transfere tokens ERC20 com verificações de segurança
     * @param token Endereço do token
     * @param to Destinatário
     * @param amount Quantidade
     */
    function transferTokens(
        address token,
        address to,
        uint256 amount
    ) external nonReentrant whenNotPaused onlyWalletOwner(msg.sender) withinLimits(msg.sender, amount) rateLimited(msg.sender) validAddress(to) {
        require(whitelistedTokens[token], "Token not whitelisted");
        require(to != address(0), "Invalid recipient");
        require(to != address(this), "Cannot transfer to contract");
        require(amount > 0, "Invalid amount");

        // Verificar saldo do usuário
        uint256 userBalance = IERC20(token).balanceOf(msg.sender);
        require(userBalance >= amount, "Insufficient balance");

        // Verificar allowance
        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= amount, "Insufficient allowance");

        // Executar transferência
        IERC20(token).transferFrom(msg.sender, to, amount);
        updateSpentLimits(msg.sender, amount);
        updateRateLimit(msg.sender);

        emit TokensTransferred(msg.sender, to, token, amount);
    }

    /**
     * @dev Transfere tokens nativos (ETH/MATIC/BNB) com verificações de segurança
     * @param to Destinatário
     */
    function transferNative(
        address payable to
    ) external payable nonReentrant whenNotPaused onlyWalletOwner(msg.sender) withinLimits(msg.sender, msg.value) rateLimited(msg.sender) validAddress(to) {
        require(to != address(0), "Invalid recipient");
        require(to != address(this), "Cannot transfer to contract");
        require(msg.value > 0, "Invalid amount");
        require(address(this).balance >= msg.value, "Insufficient contract balance");

        // Executar transferência com verificação de sucesso
        (bool success, ) = to.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        updateSpentLimits(msg.sender, msg.value);
        updateRateLimit(msg.sender);

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
     * @dev Verifica rate limiting
     * @param wallet Endereço da carteira
     */
    function checkRateLimit(address wallet) internal view returns (bool) {
        WalletInfo storage info = wallets[wallet];
        
        if (block.timestamp >= info.lastDayReset + RATE_LIMIT_PERIOD) {
            return true; // Reset do período
        }
        
        return info.guardiansCount < MAX_TRANSACTIONS_PER_PERIOD;
    }

    /**
     * @dev Atualiza rate limiting após uma transação
     * @param wallet Endereço da carteira
     */
    function updateRateLimit(address wallet) internal {
        WalletInfo storage info = wallets[wallet];
        
        if (block.timestamp >= info.lastDayReset + RATE_LIMIT_PERIOD) {
            info.guardiansCount = 1;
            info.lastDayReset = block.timestamp;
        } else {
            info.guardiansCount++;
        }
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
