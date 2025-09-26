import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  logoUrl: string;
}

interface LiquidityPoolCardProps {
  token0: Token;
  token1: Token;
  poolShare: string;
  totalLiquidity: string;
  apy: string;
  rewards24h: string;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
  onClaimRewards?: () => void;
  loading?: boolean;
}

export const LiquidityPoolCard: React.FC<LiquidityPoolCardProps> = ({
  token0,
  token1,
  poolShare,
  totalLiquidity,
  apy,
  rewards24h,
  onAddLiquidity,
  onRemoveLiquidity,
  onClaimRewards,
  loading = false
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.poolInfo}>
          <Text style={styles.poolPair}>
            {token0.symbol}/{token1.symbol}
          </Text>
          <Text style={styles.poolType}>Pool de Liquidez</Text>
        </View>
        <View style={styles.apyContainer}>
          <Text style={styles.apyLabel}>APY</Text>
          <Text style={styles.apyValue}>{apy}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sua Participação</Text>
          <Text style={styles.statValue}>{poolShare}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Liquidez Total</Text>
          <Text style={styles.statValue}>{totalLiquidity}</Text>
        </View>
      </View>

      <View style={styles.balancesContainer}>
        <Text style={styles.balancesTitle}>Seus Tokens</Text>
        <View style={styles.tokenBalance}>
          <Text style={styles.tokenSymbol}>{token0.symbol}</Text>
          <Text style={styles.tokenAmount}>{token0.balance}</Text>
        </View>
        <View style={styles.tokenBalance}>
          <Text style={styles.tokenSymbol}>{token1.symbol}</Text>
          <Text style={styles.tokenAmount}>{token1.balance}</Text>
        </View>
      </View>

      {rewards24h && onClaimRewards && (
        <View style={styles.rewardsContainer}>
          <View style={styles.rewardsInfo}>
            <Text style={styles.rewardsLabel}>Recompensas (24h)</Text>
            <Text style={styles.rewardsValue}>{rewards24h}</Text>
          </View>
          <Button
            title="Resgatar"
            onPress={onClaimRewards}
            variant="outline"
            loading={loading}
            style={styles.claimButton}
          />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <Button
          title="Adicionar"
          onPress={onAddLiquidity}
          style={[styles.actionButton, styles.addButton]}
          loading={loading}
        />
        <Button
          title="Remover"
          onPress={onRemoveLiquidity}
          variant="outline"
          style={styles.actionButton}
          loading={loading}
        />
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
  poolType: {
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
  balancesContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  balancesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  tokenBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tokenSymbol: {
    fontSize: 14,
    color: '#6b7280',
  },
  tokenAmount: {
    fontSize: 14,
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
  },
  claimButton: {
    minWidth: 100,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
  },
  addButton: {
    marginRight: 8,
  },
});
