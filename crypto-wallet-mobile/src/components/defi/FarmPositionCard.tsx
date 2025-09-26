import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { FarmPosition } from '@/types/defi';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

interface FarmPositionCardProps {
  position: FarmPosition;
  onUnstake?: () => void;
  onClaimRewards?: () => void;
}

export function FarmPositionCard({
  position,
  onUnstake,
  onClaimRewards,
}: FarmPositionCardProps) {
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

  const formatUnlockDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLocked = () => {
    return new Date(position.unlockDate) > new Date();
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
      </View>

      <View style={[styles.stats, { marginTop: spacing.md }]}>
        <View style={styles.stat}>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            Valor Staked
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
            {formatAmount(position.stakedAmount)}
          </Text>
          <Text
            style={[
              typography.caption,
              {
                color: colors.secondary[500],
                marginTop: spacing.xxs,
              },
            ]}
          >
            ({formatCurrency(position.value)})
          </Text>
        </View>

        <View style={styles.stat}>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            Recompensas Pendentes
          </Text>
          <Text
            style={[
              typography.body1,
              {
                color: colors.success[500],
                fontWeight: '600',
                marginTop: spacing.xxs,
              },
            ]}
          >
            {formatAmount(position.pendingRewards)}
          </Text>
        </View>
      </View>

      {isLocked() && (
        <View style={[styles.unlock, { marginTop: spacing.md }]}>
          <Text
            style={[
              typography.body2,
              { color: colors.warning[500] },
            ]}
          >
            Bloqueado até {formatUnlockDate(position.unlockDate)}
          </Text>
        </View>
      )}

      <View style={[styles.actions, { marginTop: spacing.lg }]}>
        {onUnstake && (
          <Button
            variant="outline"
            onPress={onUnstake}
            disabled={isLocked()}
            style={styles.actionButton}
          >
            Unstake
          </Button>
        )}
        {onClaimRewards && (
          <Button
            onPress={onClaimRewards}
            disabled={parseFloat(position.pendingRewards) === 0}
            style={styles.actionButton}
          >
            Coletar Recompensas
          </Button>
        )}
      </View>
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {},
  unlock: {},
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
