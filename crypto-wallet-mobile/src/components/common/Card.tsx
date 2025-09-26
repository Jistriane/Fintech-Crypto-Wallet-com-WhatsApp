import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ variant = 'elevated', style, children, ...props }: CardProps) {
  const { colors, borderRadius, shadows } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.background.light,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.background.light,
          borderWidth: 1,
          borderColor: colors.border.light,
        };
      case 'filled':
        return {
          backgroundColor: colors.secondary[50],
        };
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyles(),
        { borderRadius: borderRadius.lg },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
});
