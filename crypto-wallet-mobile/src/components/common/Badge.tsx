import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  children: string;
}

export function Badge({ variant = 'primary', size = 'md', children }: BadgeProps) {
  const { colors, borderRadius } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primary[100],
          text: colors.primary[700],
        };
      case 'secondary':
        return {
          background: colors.secondary[100],
          text: colors.secondary[700],
        };
      case 'success':
        return {
          background: colors.success[100],
          text: colors.success[700],
        };
      case 'error':
        return {
          background: colors.error[100],
          text: colors.error[700],
        };
      case 'warning':
        return {
          background: colors.warning[100],
          text: colors.warning[700],
        };
      default:
        return {
          background: colors.primary[100],
          text: colors.primary[700],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          fontSize: 12,
        };
      case 'lg':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 16,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: 14,
        };
    }
  };

  const { background, text } = getVariantColors();
  const { paddingVertical, paddingHorizontal, fontSize } = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: background,
          borderRadius: borderRadius.full,
          paddingVertical,
          paddingHorizontal,
        },
      ]}
    >
      <Text style={[styles.text, { color: text, fontSize }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
  },
});
