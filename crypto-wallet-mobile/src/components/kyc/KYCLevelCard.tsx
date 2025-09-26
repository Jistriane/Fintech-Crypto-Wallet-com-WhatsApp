import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { KYCLevel } from '@/types/kyc';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Ionicons } from '@expo/vector-icons';

interface KYCLevelCardProps {
  level: KYCLevel;
  onPress?: () => void;
}

export function KYCLevelCard({ level, onPress }: KYCLevelCardProps) {
  const { colors, typography, spacing } = useTheme();

  const getStatusVariant = () => {
    switch (level.status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'AVAILABLE':
        return 'primary';
      case 'LOCKED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = () => {
    switch (level.status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'IN_PROGRESS':
        return 'time';
      case 'AVAILABLE':
        return 'arrow-forward-circle';
      case 'LOCKED':
        return 'lock-closed';
      default:
        return 'help-circle';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={level.status === 'LOCKED'}
      activeOpacity={0.7}
    >
      <Card
        variant="elevated"
        style={[
          styles.container,
          level.status === 'LOCKED' && { opacity: 0.7 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                typography.h3,
                { color: colors.text.light },
              ]}
            >
              Nível {level.level}
            </Text>
            <Badge
              variant={getStatusVariant()}
              size="sm"
              style={{ marginLeft: spacing.sm }}
            >
              {level.status}
            </Badge>
          </View>
          <Ionicons
            name={getStatusIcon()}
            size={24}
            color={colors[getStatusVariant()][500]}
          />
        </View>

        <Text
          style={[
            typography.body1,
            {
              color: colors.text.light,
              marginTop: spacing.sm,
            },
          ]}
        >
          {level.name}
        </Text>

        <Text
          style={[
            typography.body2,
            {
              color: colors.secondary[500],
              marginTop: spacing.xs,
            },
          ]}
        >
          {level.description}
        </Text>

        <View style={[styles.section, { marginTop: spacing.md }]}>
          <Text
            style={[
              typography.body2,
              { color: colors.text.light, fontWeight: '600' },
            ]}
          >
            Requisitos
          </Text>
          {level.requirements.map((requirement, index) => (
            <View
              key={index}
              style={[
                styles.requirement,
                { marginTop: index === 0 ? spacing.xs : spacing.xxs },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.primary[500]}
              />
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.secondary[500],
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                {requirement}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { marginTop: spacing.md }]}>
          <Text
            style={[
              typography.body2,
              { color: colors.text.light, fontWeight: '600' },
            ]}
          >
            Limites
          </Text>
          <View style={[styles.limits, { marginTop: spacing.xs }]}>
            <View style={styles.limit}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.secondary[500] },
                ]}
              >
                Diário
              </Text>
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.text.light,
                    fontWeight: '600',
                    marginTop: spacing.xxs,
                  },
                ]}
              >
                {formatCurrency(level.limits.daily)}
              </Text>
            </View>
            <View style={styles.limit}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.secondary[500] },
                ]}
              >
                Mensal
              </Text>
              <Text
                style={[
                  typography.body2,
                  {
                    color: colors.text.light,
                    fontWeight: '600',
                    marginTop: spacing.xxs,
                  },
                ]}
              >
                {formatCurrency(level.limits.monthly)}
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {},
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limit: {
    flex: 1,
  },
});
