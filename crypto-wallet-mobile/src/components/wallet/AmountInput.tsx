import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Card } from '@/components/common/Card';

interface AmountInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  maxAmount?: string;
  symbol: string;
  usdPrice?: number;
  error?: string;
}

export function AmountInput({
  value,
  onChangeValue,
  maxAmount,
  symbol,
  usdPrice,
  error,
}: AmountInputProps) {
  const { colors, typography, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const [usdValue, setUsdValue] = useState('');
  const [isEditingUsd, setIsEditingUsd] = useState(false);

  useEffect(() => {
    if (!isEditingUsd && value && usdPrice) {
      const tokenAmount = parseFloat(value);
      const usd = (tokenAmount * usdPrice).toFixed(2);
      setUsdValue(usd);
    }
  }, [value, usdPrice, isEditingUsd]);

  const handleTokenAmountChange = (amount: string) => {
    if (amount === '') {
      onChangeValue('');
      setUsdValue('');
      return;
    }

    const numericValue = amount.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 8) return;

    onChangeValue(numericValue);
    setIsEditingUsd(false);
  };

  const handleUsdAmountChange = (amount: string) => {
    if (amount === '') {
      setUsdValue('');
      onChangeValue('');
      return;
    }

    const numericValue = amount.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;

    setUsdValue(numericValue);
    if (usdPrice) {
      const tokenAmount = (parseFloat(numericValue) / usdPrice).toFixed(8);
      onChangeValue(tokenAmount);
    }
    setIsEditingUsd(true);
  };

  const handleMaxPress = () => {
    if (maxAmount) {
      onChangeValue(maxAmount);
      setIsEditingUsd(false);
    }
  };

  return (
    <Card
      variant="outlined"
      style={[
        styles.container,
        {
          borderColor: error
            ? colors.error[500]
            : isFocused
            ? colors.primary[500]
            : colors.border.light,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            value={value}
            onChangeText={handleTokenAmountChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.secondary[400]}
            style={[
              typography.h2,
              {
                color: colors.text.light,
                flex: 1,
              },
            ]}
          />
          <Text
            style={[
              typography.h2,
              { color: colors.secondary[500] },
            ]}
          >
            {symbol}
          </Text>
        </View>

        {usdPrice && (
          <View style={styles.usdContainer}>
            <Text style={[typography.body2, { color: colors.secondary[500] }]}>
              $
            </Text>
            <TextInput
              value={usdValue}
              onChangeText={handleUsdAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.secondary[400]}
              style={[
                typography.body2,
                {
                  color: colors.secondary[500],
                  flex: 1,
                  marginLeft: 4,
                },
              ]}
            />
          </View>
        )}

        {maxAmount && (
          <TouchableOpacity
            onPress={handleMaxPress}
            style={[
              styles.maxButton,
              { backgroundColor: colors.primary[50] },
            ]}
          >
            <Text
              style={[
                typography.caption,
                { color: colors.primary[500] },
              ]}
            >
              MAX
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text
          style={[
            typography.caption,
            {
              color: colors.error[500],
              marginTop: spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  content: {
    position: 'relative',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  maxButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
