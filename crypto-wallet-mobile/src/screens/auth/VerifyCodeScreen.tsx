import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/providers/ThemeProvider';
import { Screen } from '@/components/common/Screen';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyCode'>;

const CODE_LENGTH = 6;

export function VerifyCodeScreen({ route, navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { verifyCode, error, clearError } = useAuthStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const { type, email } = route.params;

  useEffect(() => {
    if (code.length === CODE_LENGTH) {
      handleVerifyCode();
    }
  }, [code]);

  const handleVerifyCode = async () => {
    if (code.length !== CODE_LENGTH) {
      return;
    }

    setLoading(true);
    try {
      await verifyCode({ code, type });
      if (type === 'RESET_PASSWORD') {
        navigation.navigate('UpdatePassword', { code });
      }
    } catch (err) {
      // Error is handled by the store
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = code.split('');
    newCode[index] = text;
    const finalCode = newCode.join('');
    setCode(finalCode);

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, { color: colors.text.light }]}>
            Verificar código
          </Text>
          <Text
            style={[
              typography.body1,
              { color: colors.secondary[500], marginTop: spacing.sm },
            ]}
          >
            {type === 'REGISTER'
              ? 'Digite o código enviado para seu email para confirmar sua conta'
              : type === 'RESET_PASSWORD'
              ? 'Digite o código enviado para seu email para redefinir sua senha'
              : 'Digite o código enviado para seu email para fazer login'}
          </Text>
          {email && (
            <Text
              style={[
                typography.body2,
                { color: colors.primary[500], marginTop: spacing.xs },
              ]}
            >
              {email}
            </Text>
          )}
        </View>

        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={clearError}
            style={{ marginBottom: spacing.md }}
          />
        )}

        <View style={styles.codeContainer}>
          {Array(CODE_LENGTH)
            .fill(0)
            .map((_, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={[
                  styles.codeInput,
                  {
                    borderColor: colors.border.light,
                    color: colors.text.light,
                    backgroundColor: colors.background.light,
                  },
                ]}
                maxLength={1}
                keyboardType="number-pad"
                value={code[index] || ''}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
        </View>

        <View style={styles.footer}>
          <Button
            onPress={handleVerifyCode}
            loading={loading}
            disabled={code.length !== CODE_LENGTH}
            style={{ marginBottom: spacing.md }}
          >
            Verificar
          </Button>

          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
          >
            Voltar
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
  },
  footer: {
    marginTop: 'auto',
  },
});
