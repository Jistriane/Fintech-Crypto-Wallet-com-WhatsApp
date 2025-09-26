import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeFiStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { YieldFarmingCard } from '../../components/defi/YieldFarmingCard';
import useDeFiStore from '../../store/defiStore';
import useWalletStore from '../../store/walletStore';

type FarmingScreenNavigationProp = NativeStackNavigationProp<DeFiStackParamList, 'Farming'>;

export const FarmingScreen = () => {
  const navigation = useNavigation<FarmingScreenNavigationProp>();
  const {
    farmingPools,
    isLoading,
    loadFarmingPools,
    stakeLPTokens,
    unstakeLPTokens,
    claimRewards,
    selectFarm,
  } = useDeFiStore();

  const { selectedWallet } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'active' | 'available'>('active');

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadFarmingPools();
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar farms'
        );
      }
    };

    loadData();
  }, []);

  const handleStake = async (farmId: string, amount: string) => {
    try {
      await stakeLPTokens({
        farmId,
        lpTokens: amount,
      });
      Alert.alert('Sucesso', 'Stake realizado com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao fazer stake'
      );
    }
  };

  const handleUnstake = async (farmId: string, amount: string) => {
    try {
      await unstakeLPTokens({
        farmId,
        lpTokens: amount,
      });
      Alert.alert('Sucesso', 'Unstake realizado com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao fazer unstake'
      );
    }
  };

  const handleClaimRewards = async (farmId: string) => {
    try {
      await claimRewards({ farmId });
      Alert.alert('Sucesso', 'Recompensas resgatadas com sucesso!');
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao resgatar recompensas'
      );
    }
  };

  if (!selectedWallet) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Carteira não selecionada</Text>
          <Text style={styles.errorText}>
            Selecione uma carteira para visualizar as farms disponíveis
          </Text>
        </Card>
      </View>
    );
  }

  const activeFarms = farmingPools.filter((farm) => farm.userStaked && parseFloat(farm.userStaked.lpTokens) > 0);
  const availableFarms = farmingPools.filter((farm) => !farm.userStaked || parseFloat(farm.userStaked.lpTokens) === 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Suas Estatísticas</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Staked</Text>
              <Text style={styles.statValue}>
                {activeFarms.reduce((acc, farm) => acc + parseFloat(farm.userStaked?.valueUSD || '0'), 0).toFixed(2)} USD
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Farms Ativas</Text>
              <Text style={styles.statValue}>{activeFarms.length}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>APY Médio</Text>
              <Text style={styles.statValue}>
                {(activeFarms.reduce((acc, farm) => acc + parseFloat(farm.apy), 0) / (activeFarms.length || 1)).toFixed(2)}%
              </Text>
            </View>
          </View>

          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>Recompensas Pendentes</Text>
            {activeFarms.map((farm) => (
              <View key={farm.id} style={styles.rewardItem}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardToken}>{farm.rewardToken.symbol}</Text>
                  <Text style={styles.rewardAmount}>
                    {farm.userStaked?.pendingRewards} {farm.rewardToken.symbol}
                  </Text>
                </View>
                <Button
                  title="Resgatar"
                  onPress={() => handleClaimRewards(farm.id)}
                  variant="outline"
                  style={styles.claimButton}
                />
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.tabContainer}>
          <Button
            title="Farms Ativas"
            onPress={() => setActiveTab('active')}
            variant={activeTab === 'active' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
          <Button
            title="Farms Disponíveis"
            onPress={() => setActiveTab('available')}
            variant={activeTab === 'available' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
        </View>

        {activeTab === 'active' ? (
          <>
            {activeFarms.length > 0 ? (
              activeFarms.map((farm) => (
                <YieldFarmingCard
                  key={farm.id}
                  poolTokens={farm.poolTokens}
                  rewardToken={farm.rewardToken}
                  stakedAmount={farm.userStaked?.lpTokens || '0'}
                  apy={farm.apy}
                  rewards24h={farm.rewards24h}
                  totalStaked={farm.totalStaked}
                  onStake={(amount) => handleStake(farm.id, amount)}
                  onUnstake={(amount) => handleUnstake(farm.id, amount)}
                  onClaimRewards={() => handleClaimRewards(farm.id)}
                />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Nenhuma Farm Ativa</Text>
                <Text style={styles.emptyText}>
                  Você ainda não tem tokens staked em nenhuma farm. Explore as farms disponíveis para começar.
                </Text>
                <Button
                  title="Ver Farms Disponíveis"
                  onPress={() => setActiveTab('available')}
                  style={styles.exploreButton}
                />
              </Card>
            )}
          </>
        ) : (
          availableFarms.map((farm) => (
            <YieldFarmingCard
              key={farm.id}
              poolTokens={farm.poolTokens}
              rewardToken={farm.rewardToken}
              stakedAmount="0"
              apy={farm.apy}
              rewards24h="0"
              totalStaked={farm.totalStaked}
              onStake={(amount) => handleStake(farm.id, amount)}
              onUnstake={(amount) => handleUnstake(farm.id, amount)}
              onClaimRewards={() => handleClaimRewards(farm.id)}
            />
          ))
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>O que é Yield Farming?</Text>
          <Text style={styles.infoText}>
            Yield Farming permite que você ganhe recompensas adicionais ao fazer stake dos seus tokens LP em farms. Cada farm tem seu próprio token de recompensa e APY.
          </Text>
          <Text style={styles.infoText}>
            Para participar, primeiro você precisa fornecer liquidez em uma pool para receber tokens LP, depois fazer stake desses tokens na farm correspondente.
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Atenção: Yield Farming envolve riscos, incluindo Impermanent Loss. Certifique-se de entender os riscos antes de participar.
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
    marginBottom: 24,
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
  rewardsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardToken: {
    fontSize: 14,
    color: '#6b7280',
  },
  rewardAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  claimButton: {
    minWidth: 100,
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
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    marginTop: 8,
  },
});
