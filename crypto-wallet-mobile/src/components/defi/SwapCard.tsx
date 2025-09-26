import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useDeFiStore } from '@/store/defiStore';
import { Card } from '@/components/common/Card';
import { TokenSelector } from '@/components/wallet/TokenSelector';
import { AmountInput } from '@/components/wallet/AmountInput';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';

interface SwapCardProps {
  onSwap: (fromToken: string, toToken: string, amount: string) => Promise<void>;
}

export function SwapCard({ onSwap }: SwapCardProps) {
  const { colors, typography, spacing } = useTheme();
  const { getSwapQuote, isLoading, error } = useDeFiStore();

  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      if (fromToken && toToken && amount) {
        try {
          const newQuote = await getSwapQuote(fromToken, toToken, amount);
          setQuote(newQuote);
        } catch (error) {
          // Error is handled by the store
        }
      } else {
        setQuote(null);
      }
    };

    fetchQuote();
  }, [fromToken, toToken, amount, getSwapQuote]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setAmount('');
    setQuote(null);
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount) {
      return;
    }

    await onSwap(fromToken, toToken, amount);
  };

  const formatPriceImpact = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            typography.h3,
            { color: colors.text.light },
          ]}
        >
          Swap
        </Text>
      </View>

      <View style={[styles.form, { marginTop: spacing.md }]}>
        <View style={styles.inputGroup}>
          <Text
            style={[
              typography.body2,
              { color: colors.secondary[500] },
            ]}
          >
            De
          </Text>
          <TokenSelector
            selectedToken={fromToken}
            onSelect={(token) => setFromToken(token.address)}
            style={{ marginTop: spacing.xs }}
          />
          <AmountInput
            value={amount}
            onChangeValue={setAmount}
            symbol={fromToken?.symbol || ''}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSwapTokens}
          style={[
            styles.swapButton,
            { backgroundColor: colors.primary[50] },
          ]}
        >
          <Ionicons
            name="swap-vertical"
            size={24}
            color={colors.primary[500]}
          />
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text
            style={[
              typography.body2,
              { color: colors.secondary[500] },
            ]}
          >
            Para
          </Text>
          <TokenSelector
            selectedToken={toToken}
            onSelect={(token) => setToToken(token.address)}
            style={{ marginTop: spacing.xs }}
          />
          {quote && (
            <Text
              style={[
                typography.h2,
                {
                  color: colors.text.light,
                  marginTop: spacing.sm,
                },
              ]}
            >
              {quote.toToken.amount} {quote.toToken.symbol}
            </Text>
          )}
        </View>
      </View>

      {quote && (
        <View style={[styles.details, { marginTop: spacing.md }]}>
          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Impacto no preço
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color:
                    quote.priceImpact > 5
                      ? colors.error[500]
                      : quote.priceImpact > 2
                      ? colors.warning[500]
                      : colors.success[500],
                },
              ]}
            >
              {formatPriceImpact(quote.priceImpact)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Taxa
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {quote.fee}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text
              style={[
                typography.body2,
                { color: colors.secondary[500] },
              ]}
            >
              Gas estimado
            </Text>
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {quote.gas}
            </Text>
          </View>
        </View>
      )}

      <Button
        onPress={handleSwap}
        loading={isLoading}
        disabled={!fromToken || !toToken || !amount || !quote}
        style={[styles.swapButton, { marginTop: spacing.lg }]}
      >
        Trocar
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {},
  form: {},
  inputGroup: {},
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 16,
  },
  details: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
