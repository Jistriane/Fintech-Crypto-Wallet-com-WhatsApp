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

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { resetPassword, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email });
      navigation.navigate('VerifyCode', { type: 'RESET_PASSWORD', email });
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
            Esqueceu sua senha?
          </Text>
          <Text
            style={[
              typography.body1,
              { color: colors.secondary[500], marginTop: spacing.sm },
            ]}
          >
            Digite seu email para receber um código de recuperação
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

          <Button
            onPress={handleResetPassword}
            loading={loading}
            disabled={!email}
            style={{ marginBottom: spacing.md }}
          >
            Enviar código
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
