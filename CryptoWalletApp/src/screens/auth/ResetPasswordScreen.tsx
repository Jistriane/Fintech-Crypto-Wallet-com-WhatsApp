import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import useAuthStore from '../../store/authStore';

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const { requestPasswordReset, isLoading } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validateForm = () => {
    if (!phone) {
      setPhoneError('Telefone é obrigatório');
      return false;
    } else if (!/^\+?[1-9]\d{10,14}$/.test(phone)) {
      setPhoneError('Telefone inválido');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleRequestReset = async () => {
    if (!validateForm()) return;

    try {
      await requestPasswordReset(phone);
      navigation.navigate('ResetPasswordConfirm', { phone });
      Alert.alert(
        'Código Enviado',
        'Um código de verificação foi enviado para seu WhatsApp'
      );
    } catch (error) {
      Alert.alert(
        'Erro ao solicitar redefinição',
        error instanceof Error ? error.message : 'Ocorreu um erro ao solicitar a redefinição de senha'
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar Senha</Text>
          <Text style={styles.subtitle}>
            Digite seu número de telefone para receber um código de verificação no WhatsApp
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Telefone"
            placeholder="Ex: +5511999999999"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneError('');
            }}
            error={phoneError}
            keyboardType="phone-pad"
          />

          <Button
            title="Enviar Código"
            onPress={handleRequestReset}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Voltar para o login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
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
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
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
