// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SmartWalletV2
 * @dev Contrato principal da carteira inteligente com suporte a upgrades e recuperação
 */
contract SmartWalletV2 is 
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable, 
    PausableUpgradeable,
    UUPSUpgradeable 
{
    using ECDSA for bytes32;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Eventos
    event WalletCreated(address indexed owner, address wallet, uint256 initialLimit);
    event TokensTransferred(address indexed from, address indexed to, address token, uint256 amount, bytes32 indexed txHash);
    event NativeTokenTransferred(address indexed from, address indexed to, uint256 amount, bytes32 indexed txHash);
    event GuardianAdded(address indexed wallet, address indexed guardian, address indexed addedBy);
    event GuardianRemoved(address indexed wallet, address indexed guardian, address indexed removedBy);
    event LimitsUpdated(address indexed wallet, uint256 dailyLimit, uint256 monthlyLimit, address indexed updatedBy);
    event RecoveryInitiated(address indexed wallet, address indexed newOwner, address indexed initiatedBy);
    event RecoveryApproved(address indexed wallet, address indexed guardian, uint256 approvalCount);
    event RecoveryExecuted(address indexed wallet, address indexed oldOwner, address indexed newOwner);
    event RecoveryCancelled(address indexed wallet, address indexed cancelledBy);
    event TransactionQueued(bytes32 indexed txHash, address indexed from, address indexed to, uint256 amount, address token);
    event TransactionExecuted(bytes32 indexed txHash, address indexed executor);
    event TransactionCancelled(bytes32 indexed txHash, address indexed cancelledBy);
    event AddressBlacklisted(address indexed addr, address indexed blacklistedBy);
    event AddressWhitelisted(address indexed addr, address indexed whitelistedBy);
    event TokenWhitelisted(address indexed token, address indexed whitelistedBy);
    event TokenBlacklisted(address indexed token, address indexed blacklistedBy);
    event EmergencyActionExecuted(string indexed action, address indexed executor);
    event FunctionPaused(bytes4 indexed functionSelector, address indexed pausedBy);
    event FunctionUnpaused(bytes4 indexed functionSelector, address indexed unpausedBy);
    event RateLimitUpdated(address indexed wallet, uint256 newLimit, address indexed updatedBy);
    event SecurityLevelChanged(address indexed wallet, uint256 newLevel, address indexed changedBy);

    // Estruturas
    struct WalletInfo {
        bool exists;
        address owner;
        uint256 dailyLimit;
        uint256 monthlyLimit;
        uint256 dailySpent;
        uint256 monthlySpent;
        uint256 lastDayReset;
        uint256 lastMonthReset;
        uint256 nonce;
        uint256 lastTxTimestamp;
        uint256 txCount;
        uint256 securityLevel; // 1: Básico, 2: Intermediário, 3: Avançado
        bool isLocked;
        mapping(address => bool) guardians;
        uint256 guardiansCount;
        mapping(bytes4 => bool) pausedFunctions;
    }

    struct RecoveryInfo {
        address newOwner;
        uint256 initiatedAt;
        mapping(address => bool) guardianApprovals;
        uint256 approvalsCount;
        bool executed;
        bool cancelled;
    }

    struct QueuedTransaction {
        address from;
        address to;
        uint256 amount;
        address token;
        uint256 queuedAt;
        bool executed;
        bool cancelled;
        mapping(address => bool) guardianApprovals;
        uint256 approvalsCount;
        bytes data;
    }

    struct SecurityConfig {
        uint256 minGuardians;
        uint256 maxGuardians;
        uint256 recoveryDelay;
        uint256 largeTxDelay;
        uint256 rateLimitPeriod;
        uint256 maxTxPerPeriod;
        uint256 largeTxThreshold;
        uint256 minGuardianApprovals;
    }

    // Estado
    mapping(address => WalletInfo) public wallets;
    mapping(address => RecoveryInfo) public recoveries;
    mapping(bytes32 => QueuedTransaction) public queuedTransactions;
    mapping(address => bool) public whitelistedTokens;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => SecurityConfig) public securityConfigs;
    
    // Configurações padrão
    uint256 public constant DEFAULT_RECOVERY_DELAY = 24 hours;
    uint256 public constant DEFAULT_LARGE_TX_DELAY = 12 hours;
    uint256 public constant DEFAULT_RATE_LIMIT_PERIOD = 1 hours;
    uint256 public constant DEFAULT_MAX_TX_PER_PERIOD = 10;
    uint256 public constant DEFAULT_LARGE_TX_THRESHOLD = 10 ether;
    uint256 public constant DEFAULT_MIN_GUARDIAN_APPROVALS = 3;
    uint256 public constant DEFAULT_MIN_GUARDIANS = 3;
    uint256 public constant DEFAULT_MAX_GUARDIANS = 5;

    // Modificadores
    modifier onlyWalletOwner(address wallet) {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(msg.sender == wallets[wallet].owner, "Not wallet owner");
        require(!wallets[wallet].isLocked, "Wallet is locked");
        _;
    }

    modifier withinLimits(address wallet, uint256 amount) {
        require(checkLimits(wallet, amount), "Transaction exceeds limits");
        _;
    }

    modifier notBlacklisted(address addr) {
        require(!blacklistedAddresses[addr], "Address is blacklisted");
        _;
    }

    modifier withinRateLimit(address wallet) {
        require(checkRateLimit(wallet), "Rate limit exceeded");
        _;
    }

    modifier whenFunctionNotPaused(bytes4 functionSelector) {
        require(!wallets[msg.sender].pausedFunctions[functionSelector], "Function is paused");
        _;
    }

    modifier validSecurityLevel(uint256 level) {
        require(level >= 1 && level <= 3, "Invalid security level");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(EMERGENCY_ROLE, msg.sender);

        _pause(); // Inicialmente pausado para configuração
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {}

    // Funções de Visualização

    /**
     * @dev Retorna informações da carteira
     */
    function getWalletInfo(address wallet) external view returns (
        bool exists,
        address owner,
        uint256 dailyLimit,
        uint256 monthlyLimit,
        uint256 dailySpent,
        uint256 monthlySpent,
        uint256 guardiansCount,
        uint256 securityLevel,
        bool isLocked
    ) {
        WalletInfo storage info = wallets[wallet];
        return (
            info.exists,
            info.owner,
            info.dailyLimit,
            info.monthlyLimit,
            info.dailySpent,
            info.monthlySpent,
            info.guardiansCount,
            info.securityLevel,
            info.isLocked
        );
    }

    /**
     * @dev Verifica se um endereço é guardião de uma carteira
     */
    function isGuardian(address wallet, address guardian) external view returns (bool) {
        return wallets[wallet].guardians[guardian];
    }

    /**
     * @dev Retorna informações de recuperação
     */
    function getRecoveryInfo(address wallet) external view returns (
        address newOwner,
        uint256 initiatedAt,
        uint256 approvalsCount,
        bool executed,
        bool cancelled
    ) {
        RecoveryInfo storage recovery = recoveries[wallet];
        return (
            recovery.newOwner,
            recovery.initiatedAt,
            recovery.approvalsCount,
            recovery.executed,
            recovery.cancelled
        );
    }

    /**
     * @dev Retorna informações de uma transação na fila
     */
    function getQueuedTransaction(bytes32 txHash) external view returns (
        address from,
        address to,
        uint256 amount,
        address token,
        uint256 queuedAt,
        bool executed,
        bool cancelled,
        uint256 approvalsCount
    ) {
        QueuedTransaction storage queuedTx = queuedTransactions[txHash];
        return (
            queuedTx.from,
            queuedTx.to,
            queuedTx.amount,
            queuedTx.token,
            queuedTx.queuedAt,
            queuedTx.executed,
            queuedTx.cancelled,
            queuedTx.approvalsCount
        );
    }

    /**
     * @dev Retorna configurações de segurança
     */
    function getSecurityConfig(address wallet) external view returns (SecurityConfig memory) {
        return securityConfigs[wallet];
    }

    /**
     * @dev Verifica se uma função está pausada
     */
    function isFunctionPaused(address wallet, bytes4 functionSelector) external view returns (bool) {
        return wallets[wallet].pausedFunctions[functionSelector];
    }

    /**
     * @dev Retorna o nonce atual da carteira
     */
    function getNonce(address wallet) external view returns (uint256) {
        return wallets[wallet].nonce;
    }

    /**
     * @dev Retorna informações de rate limit
     */
    function getRateLimitInfo(address wallet) external view returns (
        uint256 txCount,
        uint256 lastTxTimestamp
    ) {
        WalletInfo storage info = wallets[wallet];
        return (info.txCount, info.lastTxTimestamp);
    }

    // Funções de Criação e Configuração

    /**
     * @dev Cria uma nova carteira
     */
    function createWallet(
        uint256 initialLimit,
        uint256 securityLevel
    ) external whenNotPaused validSecurityLevel(securityLevel) {
        require(!wallets[msg.sender].exists, "Wallet already exists");
        
        WalletInfo storage wallet = wallets[msg.sender];
        wallet.exists = true;
        wallet.owner = msg.sender;
        wallet.dailyLimit = initialLimit;
        wallet.monthlyLimit = initialLimit * 30;
        wallet.lastDayReset = block.timestamp;
        wallet.lastMonthReset = block.timestamp;
        wallet.nonce = 0;
        wallet.lastTxTimestamp = 0;
        wallet.txCount = 0;
        wallet.securityLevel = securityLevel;
        wallet.isLocked = false;

        // Configura segurança baseada no nível
        SecurityConfig storage config = securityConfigs[msg.sender];
        config.minGuardians = DEFAULT_MIN_GUARDIANS;
        config.maxGuardians = DEFAULT_MAX_GUARDIANS;
        config.recoveryDelay = DEFAULT_RECOVERY_DELAY;
        config.largeTxDelay = DEFAULT_LARGE_TX_DELAY;
        config.rateLimitPeriod = DEFAULT_RATE_LIMIT_PERIOD;
        config.maxTxPerPeriod = DEFAULT_MAX_TX_PER_PERIOD;
        config.largeTxThreshold = DEFAULT_LARGE_TX_THRESHOLD;
        config.minGuardianApprovals = DEFAULT_MIN_GUARDIAN_APPROVALS;

        if (securityLevel == 2) {
            config.maxTxPerPeriod = 5;
            config.largeTxThreshold = 5 ether;
        } else if (securityLevel == 3) {
            config.maxTxPerPeriod = 3;
            config.largeTxThreshold = 1 ether;
            config.minGuardianApprovals = 4;
        }

        emit WalletCreated(msg.sender, msg.sender, initialLimit);
    }

    /**
     * @dev Atualiza nível de segurança
     */
    function updateSecurityLevel(
        uint256 newLevel
    ) external whenNotPaused validSecurityLevel(newLevel) onlyWalletOwner(msg.sender) {
        WalletInfo storage wallet = wallets[msg.sender];
        require(newLevel >= wallet.securityLevel, "Cannot decrease security level");
        
        wallet.securityLevel = newLevel;
        
        // Atualiza configurações de segurança
        SecurityConfig storage config = securityConfigs[msg.sender];
        if (newLevel == 2) {
            config.maxTxPerPeriod = 5;
            config.largeTxThreshold = 5 ether;
        } else if (newLevel == 3) {
            config.maxTxPerPeriod = 3;
            config.largeTxThreshold = 1 ether;
            config.minGuardianApprovals = 4;
        }

        emit SecurityLevelChanged(msg.sender, newLevel, msg.sender);
    }

    // Funções de Transação

    /**
     * @dev Transfere tokens ERC20
     */
    function transferTokens(
        address token,
        address to,
        uint256 amount,
        bytes calldata signature
    ) external nonReentrant whenNotPaused whenFunctionNotPaused(msg.sig) onlyWalletOwner(msg.sender) withinLimits(msg.sender, amount) withinRateLimit(msg.sender) notBlacklisted(to) {
        require(whitelistedTokens[token], "Token not whitelisted");
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");

        // Verifica assinatura
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            token,
            to,
            amount,
            wallets[msg.sender].nonce
        ));
        require(verifySignature(txHash, signature, msg.sender), "Invalid signature");

        // Incrementa nonce
        wallets[msg.sender].nonce++;

        // Para transações grandes, coloca na fila
        if (amount >= securityConfigs[msg.sender].largeTxThreshold) {
            queueLargeTransaction(msg.sender, to, amount, token);
            return;
        }

        // Executa transferência
        IERC20(token).transferFrom(msg.sender, to, amount);
        updateSpentLimits(msg.sender, amount);
        updateRateLimit(msg.sender);

        emit TokensTransferred(msg.sender, to, token, amount, txHash);
    }

    /**
     * @dev Transfere tokens nativos (ETH/MATIC/BNB)
     */
    function transferNative(
        address payable to,
        bytes calldata signature
    ) external payable nonReentrant whenNotPaused whenFunctionNotPaused(msg.sig) onlyWalletOwner(msg.sender) withinLimits(msg.sender, msg.value) withinRateLimit(msg.sender) notBlacklisted(to) {
        require(to != address(0), "Invalid recipient");
        require(msg.value > 0, "Invalid amount");

        // Verifica assinatura
        bytes32 txHash = keccak256(abi.encodePacked(
            msg.sender,
            to,
            msg.value,
            wallets[msg.sender].nonce
        ));
        require(verifySignature(txHash, signature, msg.sender), "Invalid signature");

        // Incrementa nonce
        wallets[msg.sender].nonce++;

        // Para transações grandes, coloca na fila
        if (msg.value >= securityConfigs[msg.sender].largeTxThreshold) {
            queueLargeTransaction(msg.sender, to, msg.value, address(0));
            return;
        }

        // Executa transferência
        to.transfer(msg.value);
        updateSpentLimits(msg.sender, msg.value);
        updateRateLimit(msg.sender);

        emit NativeTokenTransferred(msg.sender, to, msg.value, txHash);
    }

    // Funções de Recuperação

    /**
     * @dev Inicia processo de recuperação
     */
    function initiateRecovery(
        address wallet,
        address newOwner
    ) external whenNotPaused whenFunctionNotPaused(msg.sig) {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(wallets[wallet].guardians[msg.sender], "Not a guardian");
        require(newOwner != address(0), "Invalid new owner");
        require(!blacklistedAddresses[newOwner], "New owner is blacklisted");

        RecoveryInfo storage recovery = recoveries[wallet];
        require(
            recovery.newOwner == address(0) || 
            block.timestamp > recovery.initiatedAt + securityConfigs[wallet].recoveryDelay ||
            recovery.cancelled,
            "Recovery already in progress"
        );

        // Reseta aprovações anteriores
        recovery.newOwner = newOwner;
        recovery.initiatedAt = block.timestamp;
        recovery.approvalsCount = 1;
        recovery.guardianApprovals[msg.sender] = true;
        recovery.executed = false;
        recovery.cancelled = false;

        emit RecoveryInitiated(wallet, newOwner, msg.sender);
    }

    /**
     * @dev Aprova processo de recuperação
     */
    function approveRecovery(
        address wallet
    ) external whenNotPaused whenFunctionNotPaused(msg.sig) {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(wallets[wallet].guardians[msg.sender], "Not a guardian");

        RecoveryInfo storage recovery = recoveries[wallet];
        require(recovery.newOwner != address(0), "No recovery in progress");
        require(!recovery.executed, "Recovery already executed");
        require(!recovery.cancelled, "Recovery was cancelled");
        require(!recovery.guardianApprovals[msg.sender], "Already approved");
        require(
            block.timestamp <= recovery.initiatedAt + securityConfigs[wallet].recoveryDelay,
            "Recovery expired"
        );

        recovery.guardianApprovals[msg.sender] = true;
        recovery.approvalsCount++;

        emit RecoveryApproved(wallet, msg.sender, recovery.approvalsCount);

        // Se atingiu número mínimo de aprovações, executa recuperação
        if (recovery.approvalsCount >= securityConfigs[wallet].minGuardianApprovals) {
            executeRecovery(wallet);
        }
    }

    /**
     * @dev Cancela processo de recuperação
     */
    function cancelRecovery(
        address wallet
    ) external whenNotPaused whenFunctionNotPaused(msg.sig) {
        require(wallets[wallet].exists, "Wallet does not exist");
        require(
            wallets[wallet].owner == msg.sender ||
            wallets[wallet].guardians[msg.sender] ||
            hasRole(EMERGENCY_ROLE, msg.sender),
            "Not authorized"
        );

        RecoveryInfo storage recovery = recoveries[wallet];
        require(recovery.newOwner != address(0), "No recovery in progress");
        require(!recovery.executed, "Recovery already executed");
        require(!recovery.cancelled, "Recovery already cancelled");

        recovery.cancelled = true;

        emit RecoveryCancelled(wallet, msg.sender);
    }

    // Funções de Emergência

    /**
     * @dev Pausa uma função específica
     */
    function pauseFunction(
        address wallet,
        bytes4 functionSelector
    ) external onlyRole(EMERGENCY_ROLE) {
        require(wallets[wallet].exists, "Wallet does not exist");
        wallets[wallet].pausedFunctions[functionSelector] = true;
        emit FunctionPaused(functionSelector, msg.sender);
    }

    /**
     * @dev Despausa uma função específica
     */
    function unpauseFunction(
        address wallet,
        bytes4 functionSelector
    ) external onlyRole(EMERGENCY_ROLE) {
        require(wallets[wallet].exists, "Wallet does not exist");
        wallets[wallet].pausedFunctions[functionSelector] = false;
        emit FunctionUnpaused(functionSelector, msg.sender);
    }

    /**
     * @dev Bloqueia uma carteira em emergência
     */
    function lockWallet(address wallet) external onlyRole(EMERGENCY_ROLE) {
        require(wallets[wallet].exists, "Wallet does not exist");
        wallets[wallet].isLocked = true;
        emit EmergencyActionExecuted("WALLET_LOCKED", msg.sender);
    }

    /**
     * @dev Desbloqueia uma carteira
     */
    function unlockWallet(address wallet) external onlyRole(EMERGENCY_ROLE) {
        require(wallets[wallet].exists, "Wallet does not exist");
        wallets[wallet].isLocked = false;
        emit EmergencyActionExecuted("WALLET_UNLOCKED", msg.sender);
    }

    // Funções Internas

    /**
     * @dev Executa processo de recuperação
     */
    function executeRecovery(address wallet) internal {
        RecoveryInfo storage recovery = recoveries[wallet];
        require(!recovery.executed, "Recovery already executed");
        require(!recovery.cancelled, "Recovery was cancelled");
        require(
            recovery.approvalsCount >= securityConfigs[wallet].minGuardianApprovals,
            "Insufficient approvals"
        );
        require(
            block.timestamp <= recovery.initiatedAt + securityConfigs[wallet].recoveryDelay,
            "Recovery expired"
        );

        address oldOwner = wallets[wallet].owner;
        address newOwner = recovery.newOwner;

        // Atualiza dono da carteira
        wallets[wallet].owner = newOwner;
        recovery.executed = true;

        emit RecoveryExecuted(wallet, oldOwner, newOwner);
    }

    /**
     * @dev Coloca uma transação grande na fila
     */
    function queueLargeTransaction(
        address from,
        address to,
        uint256 amount,
        address token
    ) internal {
        bytes32 txHash = keccak256(abi.encodePacked(
            from,
            to,
            amount,
            token,
            block.timestamp
        ));

        QueuedTransaction storage queuedTx = queuedTransactions[txHash];
        queuedTx.from = from;
        queuedTx.to = to;
        queuedTx.amount = amount;
        queuedTx.token = token;
        queuedTx.queuedAt = block.timestamp;
        queuedTx.executed = false;
        queuedTx.cancelled = false;
        queuedTx.approvalsCount = 0;

        emit TransactionQueued(txHash, from, to, amount, token);
    }

    /**
     * @dev Verifica assinatura de uma transação
     */
    function verifySignature(
        bytes32 txHash,
        bytes memory signature,
        address expectedSigner
    ) internal pure returns (bool) {
        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            txHash
        ));
        address recoveredSigner = ethSignedHash.recover(signature);
        return recoveredSigner == expectedSigner;
    }

    /**
     * @dev Verifica se uma transação está dentro dos limites
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
     */
    function updateSpentLimits(address wallet, uint256 amount) internal {
        WalletInfo storage info = wallets[wallet];
        info.dailySpent += amount;
        info.monthlySpent += amount;
    }

    /**
     * @dev Verifica rate limit de transações
     */
    function checkRateLimit(address wallet) internal view returns (bool) {
        WalletInfo storage info = wallets[wallet];
        SecurityConfig storage config = securityConfigs[wallet];

        if (block.timestamp >= info.lastTxTimestamp + config.rateLimitPeriod) {
            return true;
        }
        return info.txCount < config.maxTxPerPeriod;
    }

    /**
     * @dev Atualiza rate limit após uma transação
     */
    function updateRateLimit(address wallet) internal {
        WalletInfo storage info = wallets[wallet];
        SecurityConfig storage config = securityConfigs[wallet];

        if (block.timestamp >= info.lastTxTimestamp + config.rateLimitPeriod) {
            info.txCount = 1;
            info.lastTxTimestamp = block.timestamp;
        } else {
            info.txCount++;
        }
    }

    /**
     * @dev Função para receber ETH
     */
    receive() external payable {}
}