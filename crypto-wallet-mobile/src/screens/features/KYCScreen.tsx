import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useKYCStore } from '@/store/kycStore';
import { Screen } from '@/components/common/Screen';
import { KYCProgress } from '@/components/kyc/KYCProgress';
import { KYCLevelCard } from '@/components/kyc/KYCLevelCard';
import { KYCStatus } from '@/components/kyc/KYCStatus';
import { Alert } from '@/components/common/Alert';

type Props = NativeStackScreenProps<RootStackParamList, 'KYC'>;

export function KYCScreen({ navigation }: Props) {
  const {
    levels,
    currentLevel,
    currentRequest,
    isLoading,
    error,
    initialize,
    clearError,
  } = useKYCStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleLevelPress = (level: number) => {
    navigation.navigate('KYCVerification', { level });
  };

  return (
    <Screen
      loading={isLoading}
      refreshing={isLoading}
      onRefresh={initialize}
    >
      <View style={styles.container}>
        <KYCProgress
          levels={levels}
          currentLevel={currentLevel}
        />

        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={clearError}
            style={styles.alert}
          />
        )}

        {currentRequest && (
          <KYCStatus
            request={currentRequest}
            style={styles.status}
          />
        )}

        {levels.map((level) => (
          <KYCLevelCard
            key={level.level}
            level={level}
            onPress={() => handleLevelPress(level.level)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  alert: {
    marginTop: 16,
  },
  status: {
    marginTop: 16,
  },
});
