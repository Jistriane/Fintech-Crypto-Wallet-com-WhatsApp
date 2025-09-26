import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import useWalletStore from '../../store/walletStore';

type TransactionDetailsScreenNavigationProp = NativeStackNavigationProp<WalletStackParamList, 'TransactionDetails'>;
type TransactionDetailsScreenRouteProp = RouteProp<WalletStackParamList, 'TransactionDetails'>;

export const TransactionDetailsScreen = () => {
  const navigation = useNavigation<TransactionDetailsScreenNavigationProp>();
  const route = useRoute<TransactionDetailsScreenRouteProp>();
  const {
    selectedWallet,
    selectedTransaction,
    loadTransaction,
    isLoading,
  } = useWalletStore();

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!selectedWallet || !route.params.transactionId) {
      navigation.goBack();
      return;
    }

    const loadData = async () => {
      try {
        await loadTransaction(selectedWallet.id, route.params.transactionId);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar detalhes da transação'
        );
      }
    };

    loadData();

    // Se a transação estiver pendente, atualizar o status a cada 15 segundos
    if (selectedTransaction?.status === 'PENDING') {
      const interval = setInterval(loadData, 15000);
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [selectedWallet, route.params.transactionId, selectedTransaction?.status]);

  const handleShare = async () => {
    if (!selectedTransaction) return;

    try {
      await Share.share({
        message: `Transação ${selectedTransaction.type} de ${selectedTransaction.amount} ${selectedTransaction.token.symbol}\n\nHash: ${selectedTransaction.hash}\nRede: ${selectedTransaction.network}\nStatus: ${selectedTransaction.status}`,
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível compartilhar os detalhes da transação'
      );
    }
  };

  const handleViewExplorer = () => {
    if (!selectedTransaction) return;

    // Aqui você pode implementar a lógica para abrir o explorador de blocos
    // usando o Linking do React Native
  };

  if (!selectedWallet || !selectedTransaction) {
    return null;
  }

  const getStatusColor = () => {
    switch (selectedTransaction.status) {
      case 'CONFIRMED':
        return '#10b981';
      case 'FAILED':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusText = () => {
    switch (selectedTransaction.status) {
      case 'CONFIRMED':
        return 'Confirmada';
      case 'FAILED':
        return 'Falhou';
      default:
        return 'Pendente';
    }
  };

  const getTypeText = () => {
    switch (selectedTransaction.type) {
      case 'SEND':
        return 'Envio';
      case 'RECEIVE':
        return 'Recebimento';
      case 'SWAP':
        return 'Troca';
      case 'LIQUIDITY_ADD':
        return 'Adição de Liquidez';
      case 'LIQUIDITY_REMOVE':
        return 'Remoção de Liquidez';
      default:
        return selectedTransaction.type;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.transactionInfo}>
          <View style={styles.header}>
            <Text style={styles.type}>{getTypeText()}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor() },
              ]}
            >
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Quantidade</Text>
            <Text style={styles.amount}>
              {selectedTransaction.amount} {selectedTransaction.token.symbol}
            </Text>
            <Text style={styles.amountUSD}>{selectedTransaction.amountUSD}</Text>
          </View>

          {selectedTransaction.status === 'PENDING' && (
            <View style={styles.confirmationContainer}>
              <Text style={styles.confirmationText}>
                {selectedTransaction.confirmations} de {selectedTransaction.requiredConfirmations} confirmações
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(selectedTransaction.confirmations / selectedTransaction.requiredConfirmations) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalhes da Transação</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Hash</Text>
            <Text style={styles.detailsValue}>{selectedTransaction.hash}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>De</Text>
            <Text style={styles.detailsValue}>{selectedTransaction.fromAddress}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Para</Text>
            <Text style={styles.detailsValue}>{selectedTransaction.toAddress}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Rede</Text>
            <Text style={styles.detailsValue}>{selectedTransaction.network}</Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Taxa</Text>
            <Text style={styles.detailsValue}>
              {selectedTransaction.fee} ({selectedTransaction.feeUSD})
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsLabel}>Data</Text>
            <Text style={styles.detailsValue}>{selectedTransaction.timestamp}</Text>
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Ver no Explorador"
            onPress={handleViewExplorer}
            style={styles.button}
          />
          <Button
            title="Compartilhar"
            onPress={handleShare}
            variant="outline"
            style={styles.button}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
  transactionInfo: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  type: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  amountUSD: {
    fontSize: 18,
    color: '#6b7280',
  },
  confirmationContainer: {
    marginTop: 16,
  },
  confirmationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 2,
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
    marginBottom: 12,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    color: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
