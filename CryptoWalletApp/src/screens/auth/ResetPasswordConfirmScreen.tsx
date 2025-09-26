import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import useAuthStore from '../../store/authStore';

type ResetPasswordConfirmScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPasswordConfirm'>;
type ResetPasswordConfirmScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPasswordConfirm'>;

export const ResetPasswordConfirmScreen = () => {
  const navigation = useNavigation<ResetPasswordConfirmScreenNavigationProp>();
  const route = useRoute<ResetPasswordConfirmScreenRouteProp>();
  const { resetPassword, isLoading } = useAuthStore();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [codeError, setCodeError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;

    if (!code) {
      setCodeError('Código é obrigatório');
      isValid = false;
    } else if (!/^\d{6}$/.test(code)) {
      setCodeError('Código inválido');
      isValid = false;
    } else {
      setCodeError('');
    }

    if (!newPassword) {
      setNewPasswordError('Nova senha é obrigatória');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Nova senha deve ter no mínimo 8 caracteres');
      isValid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmNewPassword) {
      setConfirmNewPasswordError('Confirmação de senha é obrigatória');
      isValid = false;
    } else if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError('As senhas não coincidem');
      isValid = false;
    } else {
      setConfirmNewPasswordError('');
    }

    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword({
        phone: route.params.phone,
        code,
        newPassword,
        confirmNewPassword,
      });
      Alert.alert(
        'Senha Redefinida',
        'Sua senha foi redefinida com sucesso. Faça login com sua nova senha.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro ao redefinir senha',
        error instanceof Error ? error.message : 'Ocorreu um erro ao redefinir sua senha'
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
          <Text style={styles.title}>Redefinir Senha</Text>
          <Text style={styles.subtitle}>
            Digite o código recebido no WhatsApp e sua nova senha
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

          <Input
            label="Nova Senha"
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setNewPasswordError('');
            }}
            error={newPasswordError}
            secureTextEntry
          />

          <Input
            label="Confirmar Nova Senha"
            placeholder="Digite sua nova senha novamente"
            value={confirmNewPassword}
            onChangeText={(text) => {
              setConfirmNewPassword(text);
              setConfirmNewPasswordError('');
            }}
            error={confirmNewPasswordError}
            secureTextEntry
          />

          <Button
            title="Redefinir Senha"
            onPress={handleResetPassword}
            loading={isLoading}
            style={styles.resetButton}
          />
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
  resetButton: {
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
