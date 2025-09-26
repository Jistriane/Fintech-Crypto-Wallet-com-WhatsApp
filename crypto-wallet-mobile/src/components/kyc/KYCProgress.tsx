import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { KYCLevel } from '@/types/kyc';

interface KYCProgressProps {
  levels: KYCLevel[];
  currentLevel: number;
}

export function KYCProgress({ levels, currentLevel }: KYCProgressProps) {
  const { colors, typography, spacing } = useTheme();

  const getStatusColor = (level: KYCLevel) => {
    switch (level.status) {
      case 'COMPLETED':
        return colors.success[500];
      case 'IN_PROGRESS':
        return colors.warning[500];
      case 'AVAILABLE':
        return colors.primary[500];
      case 'LOCKED':
        return colors.secondary[500];
      default:
        return colors.secondary[500];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        {levels.map((level, index) => (
          <React.Fragment key={level.level}>
            <View
              style={[
                styles.progressPoint,
                {
                  backgroundColor: getStatusColor(level),
                  borderColor: colors.background.light,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.text.light,
                    fontWeight: '600',
                  },
                ]}
              >
                {level.level}
              </Text>
            </View>
            {index < levels.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor:
                      index < currentLevel
                        ? colors.success[500]
                        : colors.secondary[200],
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={[styles.labels, { marginTop: spacing.sm }]}>
        {levels.map((level) => (
          <View key={level.level} style={styles.label}>
            <Text
              style={[
                typography.caption,
                {
                  color:
                    level.level === currentLevel + 1
                      ? colors.text.light
                      : colors.secondary[500],
                  fontWeight:
                    level.level === currentLevel + 1 ? '600' : '400',
                  textAlign: 'center',
                },
              ]}
            >
              {level.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    width: 80,
  },
});
