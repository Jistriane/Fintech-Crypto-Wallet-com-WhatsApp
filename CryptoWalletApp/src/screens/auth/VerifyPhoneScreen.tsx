import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import useAuthStore from '../../store/authStore';

type VerifyPhoneScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'VerifyPhone'>;
type VerifyPhoneScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyPhone'>;

export const VerifyPhoneScreen = () => {
  const navigation = useNavigation<VerifyPhoneScreenNavigationProp>();
  const route = useRoute<VerifyPhoneScreenRouteProp>();
  const { verifyPhone, resendVerificationCode, isLoading } = useAuthStore();

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown, canResend]);

  const validateForm = () => {
    if (!code) {
      setCodeError('Código é obrigatório');
      return false;
    } else if (!/^\d{6}$/.test(code)) {
      setCodeError('Código inválido');
      return false;
    }
    setCodeError('');
    return true;
  };

  const handleVerifyCode = async () => {
    if (!validateForm()) return;

    try {
      await verifyPhone({
        phone: route.params.phone,
        code,
      });
      // Após verificação bem-sucedida, o usuário será redirecionado automaticamente
      // pelo RootNavigator quando o estado de autenticação mudar
    } catch (error) {
      Alert.alert(
        'Erro na verificação',
        error instanceof Error ? error.message : 'Ocorreu um erro ao verificar o código'
      );
    }
  };

  const handleResendCode = async () => {
    try {
      await resendVerificationCode(route.params.phone);
      setCountdown(60);
      setCanResend(false);
      Alert.alert('Sucesso', 'Um novo código foi enviado para seu WhatsApp');
    } catch (error) {
      Alert.alert(
        'Erro ao reenviar código',
        error instanceof Error ? error.message : 'Ocorreu um erro ao reenviar o código'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verificar Telefone</Text>
          <Text style={styles.subtitle}>
            Digite o código de 6 dígitos enviado para seu WhatsApp
          </Text>
          <Text style={styles.phone}>{route.params.phone}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Código de Verificação"
            placeholder="Digite o código"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              setCodeError('');
            }}
            error={codeError}
            keyboardType="numeric"
            maxLength={6}
          />

          <Button
            title="Verificar"
            onPress={handleVerifyCode}
            loading={isLoading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text style={styles.resendText}>Reenviar código</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                Reenviar código em {countdown}s
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  phone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  form: {
    marginBottom: 24,
  },
  verifyButton: {
    marginTop: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 14,
    color: '#6b7280',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
