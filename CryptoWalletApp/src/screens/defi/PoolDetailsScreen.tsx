import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeFiStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import useDeFiStore from '../../store/defiStore';
import useWalletStore from '../../store/walletStore';

type PoolDetailsScreenNavigationProp = NativeStackNavigationProp<DeFiStackParamList, 'PoolDetails'>;
type PoolDetailsScreenRouteProp = RouteProp<DeFiStackParamList, 'PoolDetails'>;

export const PoolDetailsScreen = () => {
  const navigation = useNavigation<PoolDetailsScreenNavigationProp>();
  const route = useRoute<PoolDetailsScreenRouteProp>();
  const {
    selectedPool,
    isLoading,
    loadPoolDetails,
    addLiquidity,
    removeLiquidity,
  } = useDeFiStore();

  const { selectedWallet } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [lpTokenAmount, setLpTokenAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadPoolDetails(route.params.poolId);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar detalhes da pool'
        );
      }
    };

    loadData();
  }, [route.params.poolId]);

  const handleAddLiquidity = async () => {
    if (!selectedPool || !selectedWallet) return;

    try {
      await addLiquidity({
        poolId: selectedPool.id,
        token0Amount,
        token1Amount,
        slippage,
      });

      Alert.alert(
        'Sucesso',
        'Liquidez adicionada com sucesso! Você receberá uma notificação quando a transação for confirmada.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao adicionar liquidez'
      );
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool || !selectedWallet) return;

    try {
      await removeLiquidity({
        poolId: selectedPool.id,
        lpTokens: lpTokenAmount,
        minToken0: '0', // Calcular baseado no slippage
        minToken1: '0', // Calcular baseado no slippage
        slippage,
      });

      Alert.alert(
        'Sucesso',
        'Liquidez removida com sucesso! Você receberá uma notificação quando a transação for confirmada.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao remover liquidez'
      );
    }
  };

  if (!selectedPool) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Pool não encontrada</Text>
          <Text style={styles.errorText}>
            Não foi possível carregar os detalhes da pool
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.poolInfo}>
          <Text style={styles.poolTitle}>
            {selectedPool.token0.symbol}/{selectedPool.token1.symbol}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Liquidez Total</Text>
              <Text style={styles.statValue}>{selectedPool.totalLiquidityUSD}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volume 24h</Text>
              <Text style={styles.statValue}>{selectedPool.volume24hUSD}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>APY</Text>
              <Text style={styles.statValue}>{selectedPool.apy}%</Text>
            </View>
          </View>

          {selectedPool.userLiquidity && (
            <View style={styles.userLiquidity}>
              <Text style={styles.sectionTitle}>Sua Posição</Text>

              <View style={styles.positionDetails}>
                <View style={styles.tokenAmount}>
                  <Text style={styles.tokenLabel}>{selectedPool.token0.symbol}</Text>
                  <Text style={styles.tokenValue}>
                    {selectedPool.userLiquidity.token0Amount}
                  </Text>
                </View>

                <View style={styles.tokenAmount}>
                  <Text style={styles.tokenLabel}>{selectedPool.token1.symbol}</Text>
                  <Text style={styles.tokenValue}>
                    {selectedPool.userLiquidity.token1Amount}
                  </Text>
                </View>

                <View style={styles.positionStats}>
                  <Text style={styles.positionLabel}>Valor Total</Text>
                  <Text style={styles.positionValue}>
                    {selectedPool.userLiquidity.valueUSD}
                  </Text>
                </View>

                <View style={styles.positionStats}>
                  <Text style={styles.positionLabel}>Share da Pool</Text>
                  <Text style={styles.positionValue}>
                    {selectedPool.userLiquidity.shareOfPool}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Card>

        <View style={styles.tabContainer}>
          <Button
            title="Adicionar"
            onPress={() => setActiveTab('add')}
            variant={activeTab === 'add' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
          <Button
            title="Remover"
            onPress={() => setActiveTab('remove')}
            variant={activeTab === 'remove' ? 'primary' : 'outline'}
            style={styles.tabButton}
          />
        </View>

        {activeTab === 'add' ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Adicionar Liquidez</Text>

            <Input
              label={`Quantidade de ${selectedPool.token0.symbol}`}
              value={token0Amount}
              onChangeText={setToken0Amount}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Input
              label={`Quantidade de ${selectedPool.token1.symbol}`}
              value={token1Amount}
              onChangeText={setToken1Amount}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Input
              label="Slippage (%)"
              value={slippage}
              onChangeText={setSlippage}
              placeholder="0.5"
              keyboardType="numeric"
            />

            <Button
              title="Adicionar Liquidez"
              onPress={handleAddLiquidity}
              loading={isLoading}
              style={styles.actionButton}
            />
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Remover Liquidez</Text>

            <Input
              label="Quantidade de LP Tokens"
              value={lpTokenAmount}
              onChangeText={setLpTokenAmount}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <Input
              label="Slippage (%)"
              value={slippage}
              onChangeText={setSlippage}
              placeholder="0.5"
              keyboardType="numeric"
            />

            <Button
              title="Remover Liquidez"
              onPress={handleRemoveLiquidity}
              loading={isLoading}
              style={styles.actionButton}
            />
          </Card>
        )}

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informações da Pool</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Taxa</Text>
            <Text style={styles.infoValue}>{selectedPool.fee}%</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Preço</Text>
            <Text style={styles.infoValue}>
              1 {selectedPool.token0.symbol} = {parseFloat(selectedPool.token1.price) / parseFloat(selectedPool.token0.price)} {selectedPool.token1.symbol}
            </Text>
          </View>

          <Text style={styles.warningText}>
            ⚠️ Atenção: Fornecer liquidez envolve riscos, incluindo Impermanent Loss. Certifique-se de entender os riscos antes de participar.
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
  poolInfo: {
    marginBottom: 16,
  },
  poolTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsContainer: {
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
  userLiquidity: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  positionDetails: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  tokenAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  tokenValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  positionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  positionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '500',
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
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    marginTop: 16,
  },
});
