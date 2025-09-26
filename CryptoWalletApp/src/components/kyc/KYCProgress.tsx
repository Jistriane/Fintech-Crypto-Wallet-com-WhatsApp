import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';

interface KYCProgressProps {
  currentLevel: number;
  maxLevel: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';
}

export const KYCProgress: React.FC<KYCProgressProps> = ({
  currentLevel,
  maxLevel,
  status
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
        return 'Verificação Aprovada';
      case 'REJECTED':
        return 'Verificação Rejeitada';
      case 'PENDING':
        return 'Verificação em Análise';
      default:
        return 'Verificação não Iniciada';
    }
  };

  const renderProgressSteps = () => {
    const steps = [];
    for (let i = 0; i < maxLevel; i++) {
      steps.push(
        <View
          key={i}
          style={[
            styles.progressStep,
            i < currentLevel && styles.completedStep,
            i === currentLevel - 1 && status === 'PENDING' && styles.pendingStep,
            i === currentLevel - 1 && status === 'REJECTED' && styles.rejectedStep,
          ]}
        >
          <Text style={[
            styles.stepNumber,
            (i < currentLevel || (i === currentLevel - 1 && status !== 'NOT_STARTED')) && styles.activeStepNumber
          ]}>
            {i + 1}
          </Text>
        </View>
      );

      if (i < maxLevel - 1) {
        steps.push(
          <View
            key={`line-${i}`}
            style={[
              styles.progressLine,
              i < currentLevel - 1 && styles.completedLine
            ]}
          />
        );
      }
    }
    return steps;
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Progresso da Verificação</Text>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <View style={styles.progressContainer}>
        {renderProgressSteps()}
      </View>

      <Text style={styles.levelText}>
        Nível Atual: {currentLevel} de {maxLevel}
      </Text>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  completedStep: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  pendingStep: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  rejectedStep: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStepNumber: {
    color: '#ffffff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  completedLine: {
    backgroundColor: '#10b981',
  },
  levelText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
