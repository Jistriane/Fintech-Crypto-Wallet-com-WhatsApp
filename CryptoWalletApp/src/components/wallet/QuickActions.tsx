import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onSwap: () => void;
  onSend: () => void;
  onReceive: () => void;
  onLiquidity?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSwap,
  onSend,
  onReceive,
  onLiquidity
}) => {
  const actions: QuickAction[] = [
    {
      id: 'swap',
      title: 'Swap',
      icon: '↔️',
      onPress: onSwap
    },
    {
      id: 'send',
      title: 'Enviar',
      icon: '↑',
      onPress: onSend
    },
    {
      id: 'receive',
      title: 'Receber',
      icon: '↓',
      onPress: onReceive
    },
    ...(onLiquidity ? [{
      id: 'liquidity',
      title: 'Liquidez',
      icon: '💧',
      onPress: onLiquidity
    }] : [])
  ];

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Ações Rápidas</Text>
      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    color: '#1f2937',
  },
});
