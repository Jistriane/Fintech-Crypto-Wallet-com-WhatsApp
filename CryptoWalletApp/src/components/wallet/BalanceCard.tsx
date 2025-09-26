import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';

interface BalanceCardProps {
  totalBalance: string;
  change24h: string;
  onRefresh?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  change24h,
  onRefresh
}) => {
  const isPositiveChange = parseFloat(change24h) >= 0;

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Saldo Total</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshText}>Atualizar</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.balance}>{totalBalance}</Text>
      <View style={styles.changeContainer}>
        <Text
          style={[
            styles.changeText,
            isPositiveChange ? styles.positiveChange : styles.negativeChange
          ]}
        >
          {isPositiveChange ? '+' : ''}{change24h}%
        </Text>
        <Text style={styles.periodText}>24h</Text>
      </View>
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
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  refreshText: {
    fontSize: 14,
    color: '#2563eb',
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  periodText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
