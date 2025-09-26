import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/common/Card';
import { Ionicons } from '@expo/vector-icons';

interface WalletHeaderProps {
  address: string;
  totalBalanceUsd: number;
  onSend?: () => void;
  onReceive?: () => void;
}

export function WalletHeader({
  address,
  totalBalanceUsd,
  onSend,
  onReceive,
}: WalletHeaderProps) {
  const { colors, typography, spacing } = useTheme();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.addressContainer}>
        <Text
          style={[
            typography.caption,
            { color: colors.secondary[500] },
          ]}
        >
          Carteira
        </Text>
        <View style={styles.addressContent}>
          <Text
            style={[
              typography.body2,
              { color: colors.text.light, fontWeight: '600' },
            ]}
          >
            {formatAddress(address)}
          </Text>
          <TouchableOpacity
            onPress={() => {
              // TODO: Implement copy to clipboard
            }}
            style={{ marginLeft: spacing.xs }}
          >
            <Ionicons
              name="copy-outline"
              size={16}
              color={colors.primary[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.balanceContainer}>
        <Text
          style={[
            typography.h1,
            { color: colors.text.light },
          ]}
        >
          {formatBalance(totalBalanceUsd)}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.secondary[500] },
          ]}
        >
          Saldo total
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={onSend}
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary[500] },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={colors.text.light}
          />
          <Text
            style={[
              typography.body2,
              {
                color: colors.text.light,
                marginLeft: spacing.xs,
                fontWeight: '600',
              },
            ]}
          >
            Enviar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onReceive}
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.background.light,
              borderWidth: 1,
              borderColor: colors.primary[500],
            },
          ]}
        >
          <Ionicons
            name="arrow-down"
            size={20}
            color={colors.primary[500]}
          />
          <Text
            style={[
              typography.body2,
              {
                color: colors.primary[500],
                marginLeft: spacing.xs,
                fontWeight: '600',
              },
            ]}
          >
            Receber
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
});
