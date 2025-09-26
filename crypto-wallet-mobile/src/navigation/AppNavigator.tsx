import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from './types';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { VerifyCodeScreen } from '@/screens/auth/VerifyCodeScreen';
import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { UpdatePasswordScreen } from '@/screens/auth/UpdatePasswordScreen';

// Main Screens
import { HomeScreen } from '@/screens/main/HomeScreen';
import { WalletScreen } from '@/screens/main/WalletScreen';
import { DeFiScreen } from '@/screens/main/DeFiScreen';
import { ProfileScreen } from '@/screens/main/ProfileScreen';

// Feature Screens
import { KYCScreen } from '@/screens/features/KYCScreen';
import { SendTokenScreen } from '@/screens/features/SendTokenScreen';
import { ReceiveTokenScreen } from '@/screens/features/ReceiveTokenScreen';
import { TokenDetailsScreen } from '@/screens/features/TokenDetailsScreen';
import { TransactionDetailsScreen } from '@/screens/features/TransactionDetailsScreen';
import { SwapScreen } from '@/screens/features/SwapScreen';
import { LiquidityPoolsScreen } from '@/screens/features/LiquidityPoolsScreen';
import { PoolDetailsScreen } from '@/screens/features/PoolDetailsScreen';
import { FarmingScreen } from '@/screens/features/FarmingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  const { colors } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.secondary[400],
        tabBarStyle: {
          backgroundColor: colors.background.light,
          borderTopColor: colors.border.light,
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />
      <MainTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
          tabBarLabel: 'Carteira',
        }}
      />
      <MainTab.Screen
        name="DeFi"
        component={DeFiScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
          tabBarLabel: 'DeFi',
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarLabel: 'Perfil',
        }}
      />
    </MainTab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuthStore();
  const { colors } = useTheme();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background.light,
        },
        headerTintColor: colors.text.light,
        headerShadowVisible: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="KYC" component={KYCScreen} />
          <Stack.Screen name="SendToken" component={SendTokenScreen} />
          <Stack.Screen name="ReceiveToken" component={ReceiveTokenScreen} />
          <Stack.Screen name="TokenDetails" component={TokenDetailsScreen} />
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
          <Stack.Screen name="Swap" component={SwapScreen} />
          <Stack.Screen name="LiquidityPools" component={LiquidityPoolsScreen} />
          <Stack.Screen name="PoolDetails" component={PoolDetailsScreen} />
          <Stack.Screen name="Farming" component={FarmingScreen} />
        </>
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
