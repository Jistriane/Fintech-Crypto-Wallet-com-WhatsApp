import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import useWalletStore from '../../store/walletStore';

type SendScreenNavigationProp = NativeStackNavigationProp<WalletStackParamList, 'Send'>;

export const SendScreen = () => {
  const navigation = useNavigation<SendScreenNavigationProp>();
  const { selectedWallet, selectedToken, isLoading, sendToken } = useWalletStore();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [addressError, setAddressError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [estimatedFee, setEstimatedFee] = useState('0');
  const [totalAmount, setTotalAmount] = useState('0');

  useEffect(() => {
    if (!selectedWallet || !selectedToken) {
      navigation.goBack();
    }
  }, [selectedWallet, selectedToken]);

  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      // Aqui você pode implementar a lógica para estimar a taxa
      // Por enquanto, vamos usar um valor fixo
      const fee = '0.001';
      setEstimatedFee(fee);
      setTotalAmount((parseFloat(amount) + parseFloat(fee)).toString());
    } else {
      setEstimatedFee('0');
      setTotalAmount('0');
    }
  }, [amount]);

  const validateForm = () => {
    let isValid = true;

    if (!toAddress) {
      setAddressError('Endereço é obrigatório');
      isValid = false;
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      setAddressError('Endereço inválido');
      isValid = false;
    } else {
      setAddressError('');
    }

    if (!amount) {
      setAmountError('Quantidade é obrigatória');
      isValid = false;
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError('Quantidade inválida');
      isValid = false;
    } else if (selectedToken && parseFloat(amount) > parseFloat(selectedToken.balance)) {
      setAmountError('Saldo insuficiente');
      isValid = false;
    } else {
      setAmountError('');
    }

    return isValid;
  };

  const handleSend = async () => {
    if (!validateForm() || !selectedWallet || !selectedToken) return;

    try {
      await sendToken({
        walletId: selectedWallet.id,
        tokenId: selectedToken.id,
        toAddress,
        amount,
      });

      Alert.alert(
        'Transação Enviada',
        'Sua transação foi enviada com sucesso e está sendo processada.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro ao enviar',
        error instanceof Error ? error.message : 'Ocorreu um erro ao enviar os tokens'
      );
    }
  };

  if (!selectedWallet || !selectedToken) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Card style={styles.tokenInfo}>
          <Text style={styles.label}>Token Selecionado</Text>
          <View style={styles.tokenDetails}>
            <Text style={styles.tokenSymbol}>{selectedToken.symbol}</Text>
            <Text style={styles.tokenBalance}>
              Saldo: {selectedToken.balance} {selectedToken.symbol}
            </Text>
          </View>
        </Card>

        <Card style={styles.form}>
          <Input
            label="Endereço do Destinatário"
            placeholder="0x..."
            value={toAddress}
            onChangeText={(text) => {
              setToAddress(text);
              setAddressError('');
            }}
            error={addressError}
            autoCapitalize="none"
          />

          <Input
            label="Quantidade"
            placeholder="0.00"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setAmountError('');
            }}
            error={amountError}
            keyboardType="numeric"
          />

          <View style={styles.feeContainer}>
            <Text style={styles.feeLabel}>Taxa Estimada</Text>
            <Text style={styles.feeValue}>
              {estimatedFee} {selectedToken.symbol}
            </Text>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {totalAmount} {selectedToken.symbol}
            </Text>
          </View>

          <Button
            title="Enviar"
            onPress={handleSend}
            loading={isLoading}
            style={styles.sendButton}
          />
        </Card>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
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
  tokenInfo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  tokenDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    marginBottom: 16,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  feeLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  feeValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sendButton: {
    marginTop: 8,
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
