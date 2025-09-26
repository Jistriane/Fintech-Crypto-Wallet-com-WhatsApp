import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { TokenBalance } from '@/types/wallet';
import { Card } from '@/components/common/Card';

interface TokenCardProps {
  tokenBalance: TokenBalance;
  onPress?: () => void;
}

export function TokenCard({ tokenBalance, onPress }: TokenCardProps) {
  const { colors, typography, spacing } = useTheme();
  const { token, balance, balanceUsd } = tokenBalance;

  const formatBalance = (value: string, decimals: number) => {
    const num = parseFloat(value) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const formatPriceChange = (value: number) => {
    const isPositive = value >= 0;
    return `${isPositive ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.content}>
          <View style={styles.left}>
            {token.logoUrl ? (
              <Image source={{ uri: token.logoUrl }} style={styles.logo} />
            ) : (
              <View
                style={[
                  styles.placeholderLogo,
                  { backgroundColor: colors.primary[100] },
                ]}
              >
                <Text
                  style={[
                    typography.h4,
                    { color: colors.primary[500] },
                  ]}
                >
                  {token.symbol.slice(0, 2)}
                </Text>
              </View>
            )}
            <View style={{ marginLeft: spacing.sm }}>
              <Text
                style={[
                  typography.body1,
                  { color: colors.text.light, fontWeight: '600' },
                ]}
              >
                {token.symbol}
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.secondary[500] },
                ]}
              >
                {token.network}
              </Text>
            </View>
          </View>

          <View style={styles.right}>
            <Text
              style={[
                typography.body1,
                { color: colors.text.light, fontWeight: '600' },
              ]}
            >
              {formatBalance(balance, token.decimals)} {token.symbol}
            </Text>
            <View style={styles.priceContainer}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.secondary[500] },
                ]}
              >
                {formatPrice(balanceUsd)}
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color:
                      token.priceChange24h >= 0
                        ? colors.success[500]
                        : colors.error[500],
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                {formatPriceChange(token.priceChange24h)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
