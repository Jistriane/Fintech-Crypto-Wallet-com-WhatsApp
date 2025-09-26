import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { LiquidityPool } from '@/types/defi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface PoolCardProps {
  pool: LiquidityPool;
  onPress?: () => void;
}

export function PoolCard({ pool, onPress }: PoolCardProps) {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.pair}>
            <Text
              style={[
                typography.h3,
                { color: colors.text.light },
              ]}
            >
              {pool.token0.symbol}/{pool.token1.symbol}
            </Text>
            <Badge
              variant="primary"
              size="sm"
              style={{ marginLeft: spacing.sm }}
            >
              {(pool.fee / 10000).toFixed(2)}%
            </Badge>
          </View>
          <Badge variant={getApyVariant(pool.apy)} size="sm">
            APY {pool.apy.toFixed(2)}%
          </Badge>
        </View>

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
              {formatCurrency(pool.tvl)}
            </Text>
          </View>

          <View style={styles.stat}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              Volume 24h
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
              {formatCurrency(pool.volume24h)}
            </Text>
          </View>
        </View>

        <View style={[styles.reserves, { marginTop: spacing.md }]}>
          <View style={styles.reserve}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              {pool.token0.symbol}
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.text.light,
                  marginTop: spacing.xxs,
                },
              ]}
            >
              {formatAmount(pool.token0.reserve, pool.token0.decimals)}
            </Text>
          </View>

          <View style={styles.reserve}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              {pool.token1.symbol}
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.text.light,
                  marginTop: spacing.xxs,
                },
              ]}
            >
              {formatAmount(pool.token1.reserve, pool.token1.decimals)}
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
  pair: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {},
  reserves: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reserve: {},
});
