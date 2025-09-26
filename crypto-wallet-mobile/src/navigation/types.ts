import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyCode: {
    type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD';
    email?: string;
  };
  ResetPassword: undefined;
  UpdatePassword: {
    code: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  DeFi: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  KYC: undefined;
  SendToken: {
    tokenSymbol: string;
    tokenAddress: string;
  };
  ReceiveToken: {
    tokenSymbol: string;
    tokenAddress: string;
  };
  TokenDetails: {
    tokenSymbol: string;
    tokenAddress: string;
  };
  TransactionDetails: {
    transactionId: string;
  };
  Swap: undefined;
  LiquidityPools: undefined;
  PoolDetails: {
    poolId: string;
  };
  Farming: undefined;
};
