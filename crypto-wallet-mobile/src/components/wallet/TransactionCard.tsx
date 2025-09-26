import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Transaction } from '@/types/wallet';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Ionicons } from '@expo/vector-icons';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const { colors, typography, spacing } = useTheme();

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'SEND':
        return 'arrow-up-circle';
      case 'RECEIVE':
        return 'arrow-down-circle';
      case 'SWAP':
        return 'swap-horizontal';
      case 'ADD_LIQUIDITY':
        return 'add-circle';
      case 'REMOVE_LIQUIDITY':
        return 'remove-circle';
      case 'FARM':
        return 'leaf';
      default:
        return 'ellipse';
    }
  };

  const getTypeColor = () => {
    switch (transaction.type) {
      case 'SEND':
        return colors.error[500];
      case 'RECEIVE':
        return colors.success[500];
      case 'SWAP':
        return colors.warning[500];
      case 'ADD_LIQUIDITY':
        return colors.primary[500];
      case 'REMOVE_LIQUIDITY':
        return colors.secondary[500];
      case 'FARM':
        return colors.success[500];
      default:
        return colors.secondary[500];
    }
  };

  const getStatusVariant = () => {
    switch (transaction.status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string, symbol: string) => {
    const num = parseFloat(amount);
    return `${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })} ${symbol}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.left}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: getTypeColor() + '20' },
              ]}
            >
              <Ionicons
                name={getTypeIcon()}
                size={24}
                color={getTypeColor()}
              />
            </View>
            <View style={{ marginLeft: spacing.sm }}>
              <Text
                style={[
                  typography.body1,
                  { color: colors.text.light, fontWeight: '600' },
                ]}
              >
                {transaction.type}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.secondary[500] },
                ]}
              >
                {formatAddress(transaction.from)} →{' '}
                {formatAddress(transaction.to)}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text
              style={[
                typography.body1,
                { color: colors.text.light, fontWeight: '600' },
              ]}
            >
              {formatAmount(transaction.amount, transaction.tokenSymbol)}
            </Text>
            <View style={styles.statusContainer}>
              <Badge variant={getStatusVariant()} size="sm">
                {transaction.status}
              </Badge>
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.secondary[500],
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                {formatDate(transaction.timestamp)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
