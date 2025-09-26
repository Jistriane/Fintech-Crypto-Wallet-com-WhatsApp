import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface Token {
  symbol: string;
  name: string;
  logoUrl: string;
}

interface YieldFarmingCardProps {
  poolTokens: [Token, Token];
  rewardToken: Token;
  stakedAmount: string;
  apy: string;
  rewards24h: string;
  totalStaked: string;
  onStake: () => void;
  onUnstake: () => void;
  onClaimRewards: () => void;
  loading?: boolean;
}

export const YieldFarmingCard: React.FC<YieldFarmingCardProps> = ({
  poolTokens,
  rewardToken,
  stakedAmount,
  apy,
  rewards24h,
  totalStaked,
  onStake,
  onUnstake,
  onClaimRewards,
  loading = false
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.poolInfo}>
          <Text style={styles.poolPair}>
            {poolTokens[0].symbol}/{poolTokens[1].symbol}
          </Text>
          <Text style={styles.farmingType}>
            Farming com {rewardToken.symbol}
          </Text>
        </View>
        <View style={styles.apyContainer}>
          <Text style={styles.apyLabel}>APY</Text>
          <Text style={styles.apyValue}>{apy}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Depositado</Text>
          <Text style={styles.statValue}>{stakedAmount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total na Pool</Text>
          <Text style={styles.statValue}>{totalStaked}</Text>
        </View>
      </View>

      <View style={styles.rewardsContainer}>
        <View style={styles.rewardsInfo}>
          <Text style={styles.rewardsLabel}>
            Recompensas em {rewardToken.symbol}
          </Text>
          <Text style={styles.rewardsValue}>{rewards24h}</Text>
          <Text style={styles.rewardsPeriod}>Últimas 24h</Text>
        </View>
        <Button
          title="Resgatar"
          onPress={onClaimRewards}
          variant="outline"
          loading={loading}
          style={styles.claimButton}
        />
      </View>

      <View style={styles.actionsContainer}>
        <Button
          title="Depositar"
          onPress={onStake}
          style={[styles.actionButton, styles.stakeButton]}
          loading={loading}
        />
        <Button
          title="Retirar"
          onPress={onUnstake}
          variant="outline"
          style={styles.actionButton}
          loading={loading}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Informações</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Token de Recompensa</Text>
          <Text style={styles.infoValue}>{rewardToken.symbol}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Período de Lock</Text>
          <Text style={styles.infoValue}>Sem lock</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Frequência de Recompensa</Text>
          <Text style={styles.infoValue}>A cada bloco</Text>
        </View>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  poolInfo: {
    flex: 1,
  },
  poolPair: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  farmingType: {
    fontSize: 14,
    color: '#6b7280',
  },
  apyContainer: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  apyLabel: {
    fontSize: 12,
    color: '#059669',
  },
  apyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  rewardsInfo: {
    flex: 1,
  },
  rewardsLabel: {
    fontSize: 14,
    color: '#2563eb',
  },
  rewardsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginVertical: 4,
  },
  rewardsPeriod: {
    fontSize: 12,
    color: '#2563eb',
  },
  claimButton: {
    minWidth: 100,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  stakeButton: {
    marginRight: 8,
  },
  infoContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
});
