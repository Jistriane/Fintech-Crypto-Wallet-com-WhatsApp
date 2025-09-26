import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  source?: { uri: string };
  fallback?: string;
}

export function Avatar({ size = 'md', source, fallback }: AvatarProps) {
  const { colors, borderRadius } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 24;
      case 'xl':
        return 32;
      default:
        return 18;
    }
  };

  const dimensions = getSize();
  const fontSize = getFontSize();

  const getFallbackInitials = () => {
    if (!fallback) return '';
    return fallback
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: borderRadius.full,
          backgroundColor: source ? 'transparent' : colors.primary[100],
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: dimensions,
              height: dimensions,
              borderRadius: borderRadius.full,
            },
          ]}
        />
      ) : (
        <Text
          style={[
            styles.fallback,
            {
              fontSize,
              color: colors.primary[700],
            },
          ]}
        >
          {getFallbackInitials()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    fontWeight: '600',
  },
});
