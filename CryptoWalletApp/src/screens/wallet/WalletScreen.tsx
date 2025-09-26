import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BalanceCard } from '../../components/wallet/BalanceCard';
import { QuickActions } from '../../components/wallet/QuickActions';
import { TokenList } from '../../components/wallet/TokenList';
import { TransactionList } from '../../components/wallet/TransactionList';
import useWalletStore from '../../store/walletStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../navigation/types';

type WalletScreenNavigationProp = NativeStackNavigationProp<WalletStackParamList, 'WalletHome'>;

export const WalletScreen = () => {
  const navigation = useNavigation<WalletScreenNavigationProp>();
  const {
    wallets,
    selectedWallet,
    isLoading,
    error,
    loadWallets,
    loadWallet,
    selectWallet,
    selectToken,
    selectTransaction,
  } = useWalletStore();

  const loadData = async () => {
    try {
      await loadWallets();
      if (wallets.length > 0 && !selectedWallet) {
        selectWallet(wallets[0]);
        await loadWallet(wallets[0].id);
      } else if (selectedWallet) {
        await loadWallet(selectedWallet.id);
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao carregar carteira'
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selectedWallet) {
        loadWallet(selectedWallet.id);
      }
    }, [selectedWallet])
  );

  const handleRefresh = async () => {
    if (selectedWallet) {
      await loadWallet(selectedWallet.id);
    }
  };

  const handleTokenPress = (token: any) => {
    selectToken(token);
    navigation.navigate('TokenDetails', { tokenId: token.id });
  };

  const handleTransactionPress = (transaction: any) => {
    selectTransaction(transaction);
    navigation.navigate('TransactionDetails', { transactionId: transaction.id });
  };

  const handleSend = () => {
    navigation.navigate('Send');
  };

  const handleReceive = () => {
    navigation.navigate('Receive');
  };

  if (!selectedWallet) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
        />
      }
    >
      <View style={styles.content}>
        <BalanceCard
          totalBalance={selectedWallet.totalBalanceUSD}
          change24h={selectedWallet.change24h}
          onRefresh={handleRefresh}
        />

        <QuickActions
          onSend={handleSend}
          onReceive={handleReceive}
          onSwap={() => navigation.navigate('Swap')}
          onLiquidity={() => navigation.navigate('Liquidity')}
        />

        <TokenList
          tokens={selectedWallet.tokens}
          onTokenPress={handleTokenPress}
        />

        <TransactionList
          transactions={selectedWallet.transactions}
          onTransactionPress={handleTransactionPress}
          onViewAll={() => {
            // Implementar navegação para lista completa de transações
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    paddingVertical: 16,
  },
});
