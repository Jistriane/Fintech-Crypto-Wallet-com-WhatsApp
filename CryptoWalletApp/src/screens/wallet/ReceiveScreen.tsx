import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import QRCode from 'react-native-qrcode-svg';
import useWalletStore from '../../store/walletStore';

type ReceiveScreenNavigationProp = NativeStackNavigationProp<WalletStackParamList, 'Receive'>;

export const ReceiveScreen = () => {
  const navigation = useNavigation<ReceiveScreenNavigationProp>();
  const { selectedWallet, selectedToken } = useWalletStore();

  const [qrValue, setQrValue] = useState('');
  const [shareText, setShareText] = useState('');

  useEffect(() => {
    if (!selectedWallet || !selectedToken) {
      navigation.goBack();
      return;
    }

    const value = {
      address: selectedWallet.address,
      network: selectedWallet.network,
      token: selectedToken.symbol,
    };

    setQrValue(JSON.stringify(value));
    setShareText(`Envie ${selectedToken.symbol} para minha carteira:\n\nEndereço: ${selectedWallet.address}\nRede: ${selectedWallet.network}`);
  }, [selectedWallet, selectedToken]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível compartilhar o endereço'
      );
    }
  };

  const handleCopyAddress = async () => {
    if (!selectedWallet) return;

    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      Alert.alert('Sucesso', 'Endereço copiado para a área de transferência');
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível copiar o endereço'
      );
    }
  };

  if (!selectedWallet || !selectedToken) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
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

        <Card style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Escaneie o QR Code</Text>
          <View style={styles.qrWrapper}>
            <QRCode
              value={qrValue}
              size={200}
              backgroundColor="white"
              color="#1f2937"
            />
          </View>
          <Text style={styles.qrDescription}>
            Use este QR Code para receber {selectedToken.symbol} na rede {selectedWallet.network}
          </Text>
        </Card>

        <Card style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Seu Endereço</Text>
          <Text style={styles.address}>{selectedWallet.address}</Text>
          <Text style={styles.networkInfo}>Rede: {selectedWallet.network}</Text>

          <View style={styles.buttonContainer}>
            <Button
              title="Copiar Endereço"
              onPress={handleCopyAddress}
              style={styles.button}
            />
            <Button
              title="Compartilhar"
              onPress={handleShare}
              variant="outline"
              style={styles.button}
            />
          </View>
        </Card>

        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>⚠️ Importante</Text>
          <Text style={styles.warningText}>
            • Certifique-se de enviar apenas {selectedToken.symbol} para este endereço
          </Text>
          <Text style={styles.warningText}>
            • Use apenas a rede {selectedWallet.network}
          </Text>
          <Text style={styles.warningText}>
            • Envios de outros tokens ou através de outras redes podem resultar em perda permanente
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
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
  qrContainer: {
    marginBottom: 16,
    alignItems: 'center',
    padding: 24,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
  },
  qrDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  networkInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  warningContainer: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9a3412',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#9a3412',
    marginBottom: 4,
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
