import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeFiStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { PoolList } from '../../components/defi/PoolList';
import useDeFiStore from '../../store/defiStore';
import useWalletStore from '../../store/walletStore';

type LiquidityPoolsScreenNavigationProp = NativeStackNavigationProp<DeFiStackParamList, 'Liquidity'>;

export const LiquidityPoolsScreen = () => {
  const navigation = useNavigation<LiquidityPoolsScreenNavigationProp>();
  const {
    popularPools,
    userPools,
    isLoading,
    loadPopularPools,
    loadUserPools,
    selectPool,
  } = useDeFiStore();

  const { selectedWallet } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'popular' | 'my'>('popular');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadPopularPools(),
          loadUserPools(),
        ]);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar pools'
        );
      }
    };

    loadData();
  }, []);

  const handlePoolPress = (pool: any) => {
    selectPool(pool);
    navigation.navigate('PoolDetails', { poolId: pool.id });
  };

  if (!selectedWallet) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Carteira não selecionada</Text>
          <Text style={styles.errorText}>
            Selecione uma carteira para visualizar as pools de liquidez
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Suas Estatísticas</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total em Pools</Text>
              <Text style={styles.statValue}>
                {userPools.reduce((acc, pool) => acc + parseFloat(pool.userLiquidity?.valueUSD || '0'), 0).toFixed(2)} USD
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pools Ativas</Text>
              <Text style={styles.statValue}>{userPools.length}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>APY Médio</Text>
              <Text style={styles.statValue}>
                {(userPools.reduce((acc, pool) => acc + parseFloat(pool.apy), 0) / (userPools.length || 1)).toFixed(2)}%
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.tabContainer}>
          <Button
            title="Pools Populares"
            onPress={() => setActiveTab('popular')}
            variant={activeTab === 'popular' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
          <Button
            title="Minhas Pools"
            onPress={() => setActiveTab('my')}
            variant={activeTab === 'my' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
        </View>

        {activeTab === 'popular' ? (
          <PoolList
            pools={popularPools}
            onPoolPress={handlePoolPress}
          />
        ) : (
          <>
            {userPools.length > 0 ? (
              <PoolList
                pools={userPools}
                onPoolPress={handlePoolPress}
                showUserPools
              />
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Nenhuma Pool Ativa</Text>
                <Text style={styles.emptyText}>
                  Você ainda não tem liquidez em nenhuma pool. Explore as pools populares para começar.
                </Text>
                <Button
                  title="Ver Pools Populares"
                  onPress={() => setActiveTab('popular')}
                  style={styles.exploreButton}
                />
              </Card>
            )}
          </>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>O que são Pools de Liquidez?</Text>
          <Text style={styles.infoText}>
            Pools de liquidez permitem que você forneça tokens para facilitar trocas e ganhe taxas de transação como recompensa. Quanto maior a liquidez fornecida, maior sua participação nas taxas.
          </Text>
          <Text style={styles.infoText}>
            Ao fornecer liquidez, você receberá tokens LP que representam sua participação na pool. Esses tokens podem ser resgatados a qualquer momento para recuperar seus tokens originais mais as taxas acumuladas.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  errorCard: {
    margin: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  exploreButton: {
    minWidth: 200,
  },
  infoCard: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
});
