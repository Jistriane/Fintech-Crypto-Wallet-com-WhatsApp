import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, message, onClose }: AlertProps) {
  const { colors, borderRadius, spacing } = useTheme();

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: colors.success[50],
          border: colors.success[200],
          icon: colors.success[500],
          text: colors.success[700],
        };
      case 'warning':
        return {
          background: colors.warning[50],
          border: colors.warning[200],
          icon: colors.warning[500],
          text: colors.warning[700],
        };
      case 'error':
        return {
          background: colors.error[50],
          border: colors.error[200],
          icon: colors.error[500],
          text: colors.error[700],
        };
      default:
        return {
          background: colors.primary[50],
          border: colors.primary[200],
          icon: colors.primary[500],
          text: colors.primary[700],
        };
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const { background, border, icon, text } = getVariantColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: background,
          borderColor: border,
          borderRadius: borderRadius.md,
          padding: spacing.md,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={getIcon()} size={24} color={icon} style={styles.icon} />
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: text }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, { color: text }]}>
            {message}
          </Text>
        </View>
      </View>

      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
  },
});
