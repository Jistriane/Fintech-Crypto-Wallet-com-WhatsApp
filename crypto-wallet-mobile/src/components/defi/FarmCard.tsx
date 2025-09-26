import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Farm } from '@/types/defi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface FarmCardProps {
  farm: Farm;
  onPress?: () => void;
}

export function FarmCard({ farm, onPress }: FarmCardProps) {
  const { colors, typography, spacing } = useTheme();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatAmount = (amount: string, decimals: number) => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const getApyVariant = (apy: number) => {
    if (apy >= 50) return 'success';
    if (apy >= 20) return 'warning';
    return 'secondary';
  };

  const formatLockPeriod = (days: number) => {
    if (days === 0) return 'Sem bloqueio';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                typography.h3,
                { color: colors.text.light },
              ]}
            >
              {farm.name}
            </Text>
            {!farm.active && (
              <Badge
                variant="error"
                size="sm"
                style={{ marginLeft: spacing.sm }}
              >
                Inativo
              </Badge>
            )}
          </View>
          <Badge variant={getApyVariant(farm.apy)} size="sm">
            APY {farm.apy.toFixed(2)}%
          </Badge>
        </View>

        <Text
          style={[
            typography.body2,
            {
              color: colors.secondary[500],
              marginTop: spacing.sm,
            },
          ]}
        >
          {farm.description}
        </Text>

        <View style={[styles.stats, { marginTop: spacing.md }]}>
          <View style={styles.stat}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              TVL
            </Text>
            <Text
              style={[
                typography.body1,
                {
                  color: colors.text.light,
                  fontWeight: '600',
                  marginTop: spacing.xxs,
                },
              ]}
            >
              {formatCurrency(farm.tvl)}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              Total Staked
            </Text>
            <Text
              style={[
                typography.body1,
                {
                  color: colors.text.light,
                  fontWeight: '600',
                  marginTop: spacing.xxs,
                },
              ]}
            >
              {formatAmount(farm.totalStaked, farm.pool.token0.decimals)}
            </Text>
          </View>
        </View>

        <View style={[styles.details, { marginTop: spacing.md }]}>
          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Token de Recompensa
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {farm.rewardToken.symbol}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Stake Mínimo
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {formatAmount(farm.minStake, farm.pool.token0.decimals)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Stake Máximo
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {formatAmount(farm.maxStake, farm.pool.token0.decimals)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Período de Bloqueio
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {formatLockPeriod(farm.lockPeriod)}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {},
  details: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
