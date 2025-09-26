import { BigNumber } from 'ethers';

export const KYC_LEVELS = {
  LEVEL_0: {
    dailyLimit: new BigNumber(0),
    monthlyLimit: new BigNumber(0),
    singleTransactionLimit: new BigNumber(0),
    allowedOperations: []
  },
  LEVEL_1: {
    dailyLimit: new BigNumber(1000), // R$ 1.000
    monthlyLimit: new BigNumber(5000), // R$ 5.000
    singleTransactionLimit: new BigNumber(500), // R$ 500
    allowedOperations: ['SWAP_BASIC', 'SELF_TRANSFER']
  },
  LEVEL_2: {
    dailyLimit: new BigNumber(10000), // R$ 10.000
    monthlyLimit: new BigNumber(50000), // R$ 50.000
    singleTransactionLimit: new BigNumber(5000), // R$ 5.000
    allowedOperations: ['ALL_SWAPS', 'THIRD_PARTY_TRANSFER', 'LIQUIDITY_POOLS', 'FIAT_CONVERSION']
  },
  LEVEL_3: {
    dailyLimit: new BigNumber('999999999'), // Ilimitado
    monthlyLimit: new BigNumber('999999999'), // Ilimitado
    singleTransactionLimit: new BigNumber('999999999'), // Ilimitado
    allowedOperations: ['ALL_OPERATIONS', 'INSTITUTIONAL']
  }
} as const;

export const NETWORK_LIMITS = {
  POLYGON: {
    minGasFee: '0.01', // MATIC
    maxSingleTransaction: '10000', // MATIC
    requiredConfirmations: 20
  },
  BSC: {
    minGasFee: '0.005', // BNB
    maxSingleTransaction: '50', // BNB
    requiredConfirmations: 15
  }
} as const;

export const WHATSAPP_SLA = {
  CRITICAL: {
    types: ['SECURITY_ALERT', 'LARGE_TRANSACTION', 'KYC_REJECTION'],
    targetDelivery: 10000, // 10 segundos em ms
    maxRetries: 5,
    escalation: 'SMS'
  },
  HIGH: {
    types: ['TRANSACTION_CONFIRMATION', '2FA_CODE', 'SWAP_COMPLETION'],
    targetDelivery: 30000, // 30 segundos em ms
    maxRetries: 3,
    escalation: 'EMAIL'
  },
  MEDIUM: {
    types: ['PORTFOLIO_UPDATE', 'APY_CHANGE', 'PRICE_ALERT'],
    targetDelivery: 120000, // 2 minutos em ms
    maxRetries: 2,
    escalation: 'PUSH'
  },
  LOW: {
    types: ['WEEKLY_SUMMARY', 'EDUCATIONAL_CONTENT', 'MARKETING'],
    targetDelivery: 900000, // 15 minutos em ms
    maxRetries: 1,
    escalation: 'NONE'
  }
} as const;
