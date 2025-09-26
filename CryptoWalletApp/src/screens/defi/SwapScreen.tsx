import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DeFiStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { SwapCard } from '../../components/defi/SwapCard';
import useDeFiStore from '../../store/defiStore';
import useWalletStore from '../../store/walletStore';
import { SwapQuote } from '../../types/defi';

type SwapScreenNavigationProp = NativeStackNavigationProp<DeFiStackParamList, 'Swap'>;

export const SwapScreen = () => {
  const navigation = useNavigation<SwapScreenNavigationProp>();
  const {
    availableTokens,
    isLoading,
    loadAvailableTokens,
    getSwapQuote,
    executeSwap,
  } = useDeFiStore();

  const { selectedWallet } = useWalletStore();

  const [fromToken, setFromToken] = useState(availableTokens[0]);
  const [toToken, setToToken] = useState(availableTokens[1]);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [slippage, setSlippage] = useState('0.5');

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAvailableTokens();
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar tokens disponíveis'
        );
      }
    };

    loadData();
  }, []);

  const handleGetQuote = async (fromAmount: string) => {
    if (!fromToken || !toToken || !fromAmount) return;

    try {
      const newQuote = await getSwapQuote(
        fromToken.address,
        toToken.address,
        fromAmount
      );
      setQuote(newQuote);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao obter cotação'
      );
    }
  };

  const handleSwap = async () => {
    if (!quote || !selectedWallet) return;

    try {
      const transactionHash = await executeSwap(quote);
      Alert.alert(
        'Sucesso',
        'Swap executado com sucesso! Você receberá uma notificação quando a transação for confirmada.',
        [
          {
            text: 'Ver Transação',
            onPress: () => {
              // Navegar para a tela de detalhes da transação
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao executar swap'
      );
    }
  };

  if (!selectedWallet) {
    return (
      <View style={styles.container}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Carteira não selecionada</Text>
          <Text style={styles.errorText}>
            Selecione uma carteira para realizar operações de swap
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <SwapCard
          fromToken={fromToken}
          toToken={toToken}
          onSelectFromToken={() => {
            // Implementar seleção de token
          }}
          onSelectToToken={() => {
            // Implementar seleção de token
          }}
          onSwap={handleSwap}
          exchangeRate={quote?.exchangeRate || '0'}
          estimatedGas={quote?.estimatedGas || '0'}
          loading={isLoading}
        />

        {quote && (
          <Card style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Detalhes da Transação</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taxa de Câmbio</Text>
              <Text style={styles.detailValue}>
                1 {fromToken.symbol} = {quote.exchangeRate} {toToken.symbol}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Impacto no Preço</Text>
              <Text style={styles.detailValue}>{quote.priceImpact}%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taxa</Text>
              <Text style={styles.detailValue}>{quote.fee}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gas Estimado</Text>
              <Text style={styles.detailValue}>{quote.estimatedGas}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slippage</Text>
              <Text style={styles.detailValue}>{slippage}%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mínimo Recebido</Text>
              <Text style={styles.detailValue}>
                {quote.minReceived} {toToken.symbol}
              </Text>
            </View>

            <View style={styles.routeContainer}>
              <Text style={styles.routeTitle}>Rota</Text>
              {quote.route.map((step, index) => (
                <View key={index} style={styles.routeStep}>
                  <Text style={styles.routeProtocol}>{step.protocol}</Text>
                  <Text style={styles.routePath}>
                    {step.path.map((token) => token.symbol).join(' → ')}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
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
  detailsCard: {
    marginTop: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  routeContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  routeStep: {
    marginBottom: 8,
  },
  routeProtocol: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  routePath: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
});
