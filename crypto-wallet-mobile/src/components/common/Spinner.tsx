import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullscreen?: boolean;
}

export function Spinner({ size = 'md', color, fullscreen = false }: SpinnerProps) {
  const { colors } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      default:
        return 'small';
    }
  };

  const spinner = (
    <ActivityIndicator
      size={getSize()}
      color={color || colors.primary[500]}
    />
  );

  if (fullscreen) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.light }]}>
        {spinner}
      </View>
    );
  }

  return spinner;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
