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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { login, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
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
            Bem-vindo de volta!
          </Text>
          <Text
            style={[
              typography.body1,
              { color: colors.secondary[500], marginTop: spacing.sm },
            ]}
          >
            Faça login para continuar
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <Alert
              variant="error"
              message={error}
              onClose={clearError}
              style={{ marginBottom: spacing.md }}
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={
              <Ionicons name="mail" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secure
            autoCapitalize="none"
            autoComplete="password"
            leftIcon={
              <Ionicons name="lock-closed" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Button
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            style={{ marginBottom: spacing.md }}
          >
            Entrar
          </Button>

          <Button
            variant="ghost"
            onPress={() => navigation.navigate('ResetPassword')}
            style={{ marginBottom: spacing.md }}
          >
            Esqueci minha senha
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[typography.body2, { color: colors.secondary[500] }]}>
            Ainda não tem uma conta?{' '}
          </Text>
          <Button
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          >
            Criar conta
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
