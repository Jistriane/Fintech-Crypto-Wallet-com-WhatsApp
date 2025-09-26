import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/providers/ThemeProvider';
import { Screen } from '@/components/common/Screen';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'UpdatePassword'>;

export function UpdatePasswordScreen({ route, navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { updatePassword, error, clearError } = useAuthStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { code } = route.params;

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setValidationError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('As senhas não coincidem');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      await updatePassword({ code, newPassword });
      navigation.navigate('Login');
    } catch (err) {
      // Error is handled by the store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.text.light }]}>
            Nova senha
          </Text>
          <Text
            style={[
              typography.body1,
              { color: colors.secondary[500], marginTop: spacing.sm },
            ]}
          >
            Digite sua nova senha
          </Text>
        </View>

        <View style={styles.form}>
          {(error || validationError) && (
            <Alert
              variant="error"
              message={error || validationError}
              onClose={error ? clearError : () => setValidationError('')}
              style={{ marginBottom: spacing.md }}
            />
          )}

          <Input
            label="Nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secure
            autoCapitalize="none"
            autoComplete="password-new"
            leftIcon={
              <Ionicons name="lock-closed" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Input
            label="Confirmar senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secure
            autoCapitalize="none"
            autoComplete="password-new"
            leftIcon={
              <Ionicons name="lock-closed" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Button
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={!newPassword || !confirmPassword}
            style={{ marginBottom: spacing.md }}
          >
            Atualizar senha
          </Button>

          <Button
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          >
            Voltar para o login
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 48,
  },
  form: {
    flex: 1,
  },
});
