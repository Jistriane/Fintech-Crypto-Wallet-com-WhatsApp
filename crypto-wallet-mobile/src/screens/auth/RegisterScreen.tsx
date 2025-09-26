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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { register, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, phone, password });
      navigation.navigate('VerifyCode', { type: 'REGISTER', email });
    } catch (err) {
      // Error is handled by the store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.text.light }]}>
            Criar conta
          </Text>
          <Text
            style={[
              typography.body1,
              { color: colors.secondary[500], marginTop: spacing.sm },
            ]}
          >
            Preencha seus dados para começar
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
            label="Nome completo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            leftIcon={
              <Ionicons name="person" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

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
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            leftIcon={
              <Ionicons name="call" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secure
            autoCapitalize="none"
            autoComplete="password-new"
            leftIcon={
              <Ionicons name="lock-closed" size={20} color={colors.secondary[500]} />
            }
            style={{ marginBottom: spacing.md }}
          />

          <Button
            onPress={handleRegister}
            loading={loading}
            disabled={!name || !email || !phone || !password}
            style={{ marginBottom: spacing.md }}
          >
            Criar conta
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={[typography.body2, { color: colors.secondary[500] }]}>
            Já tem uma conta?{' '}
          </Text>
          <Button
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          >
            Fazer login
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
