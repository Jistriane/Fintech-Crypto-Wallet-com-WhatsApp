import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  logoUrl: string;
}

interface SwapCardProps {
  fromToken: Token;
  toToken: Token;
  onSelectFromToken: () => void;
  onSelectToToken: () => void;
  onSwap: (fromAmount: string, toAmount: string) => void;
  exchangeRate: string;
  estimatedGas: string;
  loading?: boolean;
}

export const SwapCard: React.FC<SwapCardProps> = ({
  fromToken,
  toToken,
  onSelectFromToken,
  onSelectToToken,
  onSwap,
  exchangeRate,
  estimatedGas,
  loading = false
}) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    // Calcular o valor estimado baseado na taxa de câmbio
    const estimated = value ? (parseFloat(value) * parseFloat(exchangeRate)).toFixed(6) : '';
    setToAmount(estimated);
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    // Calcular o valor estimado baseado na taxa de câmbio inversa
    const estimated = value ? (parseFloat(value) / parseFloat(exchangeRate)).toFixed(6) : '';
    setFromAmount(estimated);
  };

  const handleSwap = () => {
    onSwap(fromAmount, toAmount);
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Swap</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>De</Text>
        <View style={styles.tokenInput}>
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={onSelectFromToken}
          >
            <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
            <Text style={styles.tokenName}>{fromToken.name}</Text>
          </TouchableOpacity>
          <Input
            value={fromAmount}
            onChangeText={handleFromAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            style={styles.amountInput}
          />
        </View>
        <Text style={styles.balance}>
          Saldo: {fromToken.balance} {fromToken.symbol}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => {
          onSelectFromToken();
          onSelectToToken();
        }}
      >
        <Text style={styles.switchIcon}>↕️</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Para</Text>
        <View style={styles.tokenInput}>
          <TouchableOpacity
            style={styles.tokenSelector}
            onPress={onSelectToToken}
          >
            <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
            <Text style={styles.tokenName}>{toToken.name}</Text>
          </TouchableOpacity>
          <Input
            value={toAmount}
            onChangeText={handleToAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            style={styles.amountInput}
          />
        </View>
        <Text style={styles.balance}>
          Saldo: {toToken.balance} {toToken.symbol}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Taxa de Câmbio</Text>
          <Text style={styles.infoValue}>
            1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gas Estimado</Text>
          <Text style={styles.infoValue}>{estimatedGas}</Text>
        </View>
      </View>

      <Button
        title="Confirmar Swap"
        onPress={handleSwap}
        disabled={!fromAmount || !toAmount || loading}
        loading={loading}
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tokenInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenSelector: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 100,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tokenName: {
    fontSize: 12,
    color: '#6b7280',
  },
  amountInput: {
    flex: 1,
  },
  balance: {
    fontSize: 12,
    color: '#6b7280',
  },
  switchButton: {
    alignSelf: 'center',
    padding: 8,
    marginVertical: 8,
  },
  switchIcon: {
    fontSize: 24,
  },
  infoContainer: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
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
    color: '#1f2937',
    fontWeight: '500',
  },
});
