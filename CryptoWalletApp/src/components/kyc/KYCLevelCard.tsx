import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface KYCLimit {
  dailyLimit: string;
  monthlyLimit: string;
  singleTransactionLimit: string;
}

interface KYCLevelCardProps {
  level: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';
  limits: KYCLimit;
  requirements: string[];
  onStart?: () => void;
  onRetry?: () => void;
}

export const KYCLevelCard: React.FC<KYCLevelCardProps> = ({
  level,
  status,
  limits,
  requirements,
  onStart,
  onRetry
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'APPROVED':
        return '#10b981';
      case 'REJECTED':
        return '#ef4444';
      case 'PENDING':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
      case 'PENDING':
        return 'Em Análise';
      default:
        return 'Não Iniciado';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nível {level}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.limitsContainer}>
        <Text style={styles.sectionTitle}>Limites</Text>
        <View style={styles.limitItem}>
          <Text style={styles.limitLabel}>Limite Diário:</Text>
          <Text style={styles.limitValue}>{limits.dailyLimit}</Text>
        </View>
        <View style={styles.limitItem}>
          <Text style={styles.limitLabel}>Limite Mensal:</Text>
          <Text style={styles.limitValue}>{limits.monthlyLimit}</Text>
        </View>
        <View style={styles.limitItem}>
          <Text style={styles.limitLabel}>Limite por Transação:</Text>
          <Text style={styles.limitValue}>{limits.singleTransactionLimit}</Text>
        </View>
      </View>

      <View style={styles.requirementsContainer}>
        <Text style={styles.sectionTitle}>Requisitos</Text>
        {requirements.map((requirement, index) => (
          <Text key={index} style={styles.requirementItem}>
            • {requirement}
          </Text>
        ))}
      </View>

      {status === 'NOT_STARTED' && onStart && (
        <Button
          title="Iniciar Verificação"
          onPress={onStart}
          style={styles.actionButton}
        />
      )}

      {status === 'REJECTED' && onRetry && (
        <Button
          title="Tentar Novamente"
          onPress={onRetry}
          variant="outline"
          style={styles.actionButton}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  limitsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  limitValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  requirementsContainer: {
    marginBottom: 16,
  },
  requirementItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionButton: {
    marginTop: 8,
  },
});
