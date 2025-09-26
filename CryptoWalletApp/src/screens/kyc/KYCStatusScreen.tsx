import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KYCStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { KYCProgress } from '../../components/kyc/KYCProgress';
import { KYCLevelCard } from '../../components/kyc/KYCLevelCard';
import useKYCStore from '../../store/kycStore';

type KYCStatusScreenNavigationProp = NativeStackNavigationProp<KYCStackParamList, 'KYCStatus'>;

export const KYCStatusScreen = () => {
  const navigation = useNavigation<KYCStatusScreenNavigationProp>();
  const {
    currentLevel,
    targetLevel,
    status,
    limits,
    requirements,
    isLoading,
    loadKYCStatus,
    loadKYCRequirements,
    loadCurrentLimits,
    setTargetLevel,
  } = useKYCStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadKYCStatus();
        await loadCurrentLimits();
        if (currentLevel < 3) {
          await loadKYCRequirements(currentLevel + 1);
        }
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar informações do KYC'
        );
      }
    };

    loadData();
  }, []);

  const handleStartVerification = (level: number) => {
    setTargetLevel(level);
    switch (level) {
      case 1:
        navigation.navigate('KYCLevel1');
        break;
      case 2:
        navigation.navigate('KYCLevel2');
        break;
      case 3:
        navigation.navigate('KYCLevel3');
        break;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.statusCard}>
          <Text style={styles.title}>Verificação de Identidade</Text>
          <Text style={styles.subtitle}>
            Complete a verificação para aumentar seus limites de transação
          </Text>

          <KYCProgress
            currentLevel={currentLevel}
            maxLevel={3}
            status={status}
          />
        </Card>

        <Card style={styles.limitsCard}>
          <Text style={styles.limitsTitle}>Seus Limites Atuais</Text>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Limite Diário</Text>
            <Text style={styles.limitValue}>{limits.dailyLimit}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Limite Mensal</Text>
            <Text style={styles.limitValue}>{limits.monthlyLimit}</Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitLabel}>Limite por Transação</Text>
            <Text style={styles.limitValue}>{limits.singleTransactionLimit}</Text>
          </View>
          <View style={styles.operationsContainer}>
            <Text style={styles.operationsTitle}>Operações Permitidas</Text>
            {limits.allowedOperations.map((operation, index) => (
              <Text key={index} style={styles.operation}>
                • {operation}
              </Text>
            ))}
          </View>
        </Card>

        {currentLevel < 3 && (
          <View style={styles.levelsContainer}>
            <Text style={styles.levelsTitle}>Próximos Níveis</Text>
            {[1, 2, 3].map((level) => {
              if (level > currentLevel) {
                return (
                  <KYCLevelCard
                    key={level}
                    level={level}
                    status={level === targetLevel ? status : 'NOT_STARTED'}
                    limits={{
                      dailyLimit: '5.000',
                      monthlyLimit: '25.000',
                      singleTransactionLimit: '2.500',
                    }}
                    requirements={[
                      'Documento de Identidade',
                      'Comprovante de Residência',
                      'Selfie com Documento',
                    ]}
                    onStart={() => handleStartVerification(level)}
                  />
                );
              }
              return null;
            })}
          </View>
        )}

        {status === 'REJECTED' && (
          <Card style={styles.rejectedCard}>
            <Text style={styles.rejectedTitle}>Verificação Rejeitada</Text>
            <Text style={styles.rejectedText}>
              Sua última tentativa de verificação foi rejeitada. Por favor, tente novamente com documentos válidos e legíveis.
            </Text>
            <Button
              title="Tentar Novamente"
              onPress={() => handleStartVerification(targetLevel)}
              style={styles.retryButton}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  limitsCard: {
    marginBottom: 16,
  },
  limitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  operationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  operationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  operation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  levelsContainer: {
    marginBottom: 16,
  },
  levelsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  rejectedCard: {
    backgroundColor: '#fef2f2',
    marginBottom: 16,
  },
  rejectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  rejectedText: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#991b1b',
  },
});

