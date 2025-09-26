import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Card } from '../common/Card';

interface Token {
  symbol: string;
  name: string;
  logoUrl: string;
}

interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  totalLiquidity: string;
  apy: string;
  volume24h: string;
  userShare?: string;
}

interface PoolListProps {
  pools: Pool[];
  onPoolPress: (pool: Pool) => void;
  showUserPools?: boolean;
}

export const PoolList: React.FC<PoolListProps> = ({
  pools,
  onPoolPress,
  showUserPools = false
}) => {
  const renderPool = ({ item }: { item: Pool }) => {
    return (
      <TouchableOpacity
        style={styles.poolContainer}
        onPress={() => onPoolPress(item)}
      >
        <View style={styles.poolInfo}>
          <Text style={styles.poolPair}>
            {item.token0.symbol}/{item.token1.symbol}
          </Text>
          {showUserPools && item.userShare && (
            <Text style={styles.shareText}>
              Sua participação: {item.userShare}
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>APY</Text>
            <Text style={[styles.statValue, styles.apyValue]}>{item.apy}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Liquidez Total</Text>
            <Text style={styles.statValue}>{item.totalLiquidity}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume 24h</Text>
            <Text style={styles.statValue}>{item.volume24h}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>
        {showUserPools ? 'Suas Pools' : 'Pools Disponíveis'}
      </Text>
      <FlatList
        data={pools}
        renderItem={renderPool}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  poolContainer: {
    paddingVertical: 12,
  },
  poolInfo: {
    marginBottom: 8,
  },
  poolPair: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  shareText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  apyValue: {
    color: '#059669',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  listContent: {
    paddingBottom: 8,
  },
});
