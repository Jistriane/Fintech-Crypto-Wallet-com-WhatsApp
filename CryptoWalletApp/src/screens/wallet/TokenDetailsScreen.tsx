import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TransactionList } from '../../components/wallet/TransactionList';
import useWalletStore from '../../store/walletStore';

type TokenDetailsScreenNavigationProp = NativeStackNavigationProp<WalletStackParamList, 'TokenDetails'>;
type TokenDetailsScreenRouteProp = RouteProp<WalletStackParamList, 'TokenDetails'>;

export const TokenDetailsScreen = () => {
  const navigation = useNavigation<TokenDetailsScreenNavigationProp>();
  const route = useRoute<TokenDetailsScreenRouteProp>();
  const {
    selectedWallet,
    selectedToken,
    loadToken,
    loadTransactions,
    selectTransaction,
    isLoading,
  } = useWalletStore();

  useEffect(() => {
    if (!selectedWallet || !route.params.tokenId) {
      navigation.goBack();
      return;
    }

    const loadData = async () => {
      try {
        await loadToken(selectedWallet.id, route.params.tokenId);
        await loadTransactions(selectedWallet.id);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar detalhes do token'
        );
      }
    };

    loadData();
  }, [selectedWallet, route.params.tokenId]);

  const handleSend = () => {
    navigation.navigate('Send');
  };

  const handleReceive = () => {
    navigation.navigate('Receive');
  };

  const handleTransactionPress = (transaction: any) => {
    selectTransaction(transaction);
    navigation.navigate('TransactionDetails', { transactionId: transaction.id });
  };

  if (!selectedWallet || !selectedToken) {
    return null;
  }

  // Filtrar transações apenas deste token
  const tokenTransactions = selectedWallet.transactions.filter(
    (tx) => tx.token.id === selectedToken.id
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.tokenInfo}>
          <View style={styles.tokenHeader}>
            <View>
              <Text style={styles.tokenSymbol}>{selectedToken.symbol}</Text>
              <Text style={styles.tokenName}>{selectedToken.name}</Text>
            </View>
            <Text style={styles.network}>{selectedToken.network}</Text>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Saldo</Text>
            <Text style={styles.balance}>
              {selectedToken.balance} {selectedToken.symbol}
            </Text>
            <Text style={styles.balanceUSD}>{selectedToken.balanceUSD}</Text>
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Preço</Text>
              <Text style={styles.price}>
                {selectedToken.price} {selectedToken.symbol}/USD
              </Text>
            </View>
            <View style={styles.changeInfo}>
              <Text style={styles.changeLabel}>24h</Text>
              <Text
                style={[
                  styles.change,
                  parseFloat(selectedToken.change24h) >= 0
                    ? styles.positiveChange
                    : styles.negativeChange,
                ]}
              >
                {parseFloat(selectedToken.change24h) >= 0 ? '+' : ''}
                {selectedToken.change24h}%
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Enviar"
              onPress={handleSend}
              style={styles.button}
            />
            <Button
              title="Receber"
              onPress={handleReceive}
              variant="outline"
              style={styles.button}
            />
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalhes do Token</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Contrato</Text>
            <Text style={styles.detailsValue}>{selectedToken.address}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Decimais</Text>
            <Text style={styles.detailsValue}>{selectedToken.decimals}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Rede</Text>
            <Text style={styles.detailsValue}>{selectedToken.network}</Text>
          </View>
        </Card>

        <TransactionList
          transactions={tokenTransactions}
          onTransactionPress={handleTransactionPress}
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
    padding: 16,
  },
  tokenInfo: {
    marginBottom: 16,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tokenSymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  tokenName: {
    fontSize: 16,
    color: '#6b7280',
  },
  network: {
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  balanceUSD: {
    fontSize: 18,
    color: '#6b7280',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  changeInfo: {
    alignItems: 'flex-end',
  },
  changeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
