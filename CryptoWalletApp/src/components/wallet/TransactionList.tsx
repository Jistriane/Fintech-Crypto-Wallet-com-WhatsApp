import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Card } from '../common/Card';

interface Transaction {
  id: string;
  type: 'SEND' | 'RECEIVE' | 'SWAP' | 'LIQUIDITY';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: string;
  symbol: string;
  amountUSD: string;
  timestamp: string;
  to?: string;
  from?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress: (transaction: Transaction) => void;
  onViewAll?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  onViewAll
}) => {
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'SEND':
        return '↑';
      case 'RECEIVE':
        return '↓';
      case 'SWAP':
        return '↔';
      case 'LIQUIDITY':
        return '💧';
      default:
        return '•';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'SEND':
        return '#ef4444';
      case 'RECEIVE':
        return '#10b981';
      case 'SWAP':
        return '#6366f1';
      case 'LIQUIDITY':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);
    const color = getTransactionColor(item.type);

    return (
      <TouchableOpacity
        style={styles.transactionContainer}
        onPress={() => onTransactionPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>{item.type}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.amount}>
              {item.type === 'SEND' ? '-' : ''}{item.amount} {item.symbol}
            </Text>
            <Text style={styles.amountUSD}>{item.amountUSD}</Text>
          </View>
          {item.status === 'PENDING' && (
            <Text style={styles.pendingStatus}>Pendente</Text>
          )}
          {item.status === 'FAILED' && (
            <Text style={styles.failedStatus}>Falhou</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações Recentes</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>Ver Todas</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563eb',
  },
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: '#ffffff',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 14,
    color: '#6b7280',
  },
  transactionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    color: '#1f2937',
    marginRight: 8,
  },
  amountUSD: {
    fontSize: 14,
    color: '#6b7280',
  },
  pendingStatus: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 4,
  },
  failedStatus: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  listContent: {
    paddingBottom: 8,
  },
});
