import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyPhone: { phone: string };
  ResetPassword: undefined;
  ResetPasswordConfirm: { phone: string };
};

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  DeFi: undefined;
  Profile: undefined;
};

export type WalletStackParamList = {
  WalletHome: undefined;
  Send: undefined;
  Receive: undefined;
  TokenDetails: { tokenId: string };
  TransactionDetails: { transactionId: string };
};

export type DeFiStackParamList = {
  DeFiHome: undefined;
  Swap: undefined;
  Liquidity: undefined;
  Farming: undefined;
  PoolDetails: { poolId: string };
};
