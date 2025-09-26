import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { LiquidityPosition } from '@/types/defi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface PositionCardProps {
  position: LiquidityPosition;
  onRemove?: () => void;
}

export function PositionCard({ position, onRemove }: PositionCardProps) {
  const { colors, typography, spacing } = useTheme();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
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
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              typography.h3,
              { color: colors.text.light },
            ]}
          >
            Posição #{position.id.slice(0, 8)}
          </Text>
          <Badge
            variant={getApyVariant(position.apy)}
            size="sm"
            style={{ marginLeft: spacing.sm }}
          >
            APY {position.apy.toFixed(2)}%
          </Badge>
        </View>
        <Text
          style={[
            typography.body2,
            { color: colors.secondary[500] },
          ]}
        >
          Share: {(position.share * 100).toFixed(2)}%
        </Text>
      </View>

      <View style={[styles.tokens, { marginTop: spacing.md }]}>
        <View style={styles.token}>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            Token 0
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
            {formatAmount(position.token0Amount)}
          </Text>
        </View>

        <View style={styles.token}>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            Token 1
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
            {formatAmount(position.token1Amount)}
          </Text>
        </View>
      </View>

      <View style={[styles.value, { marginTop: spacing.md }]}>
        <Text
          style={[
            typography.caption,
            { color: colors.secondary[500] },
          ]}
        >
          Valor Total
        </Text>
        <Text
          style={[
            typography.h3,
            {
              color: colors.text.light,
              marginTop: spacing.xxs,
            },
          ]}
        >
          {formatCurrency(position.value)}
        </Text>
      </View>

      {position.rewards.length > 0 && (
        <View style={[styles.rewards, { marginTop: spacing.md }]}>
          <Text
            style={[
              typography.body2,
              {
                color: colors.text.light,
                fontWeight: '600',
                marginBottom: spacing.xs,
              },
            ]}
          >
            Recompensas
          </Text>
          {position.rewards.map((reward) => (
            <View
              key={reward.token.address}
              style={styles.reward}
            >
              <Text
                style={[
                  typography.body2,
                  { color: colors.secondary[500] },
                ]}
              >
                {reward.token.symbol}
              </Text>
              <View style={styles.rewardValue}>
                <Text
                  style={[
                    typography.body2,
                    { color: colors.text.light },
                  ]}
                >
                  {formatAmount(reward.amount)}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: colors.secondary[500],
                      marginLeft: spacing.xs,
                    },
                  ]}
                >
                  ({formatCurrency(reward.value)})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {onRemove && (
        <Button
          variant="outline"
          onPress={onRemove}
          style={{ marginTop: spacing.lg }}
        >
          Remover Liquidez
        </Button>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {},
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokens: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  token: {},
  value: {},
  rewards: {},
  reward: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rewardValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
