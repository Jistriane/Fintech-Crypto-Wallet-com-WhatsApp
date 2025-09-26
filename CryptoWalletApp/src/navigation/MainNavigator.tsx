import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';

// Importar as telas quando forem criadas
// import { HomeScreen } from '../screens/home/HomeScreen';
// import { WalletScreen } from '../screens/wallet/WalletScreen';
// import { DeFiScreen } from '../screens/defi/DeFiScreen';
// import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen
        name="Home"
        component={() => null} // Substituir por HomeScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={() => null} // Substituir por WalletScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👛</Text>
          ),
        }}
      />
      <Tab.Screen
        name="DeFi"
        component={() => null} // Substituir por DeFiScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => null} // Substituir por ProfileScreen
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
