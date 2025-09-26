import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/providers/ThemeProvider';
import { useKYCStore } from '@/store/kycStore';
import { Screen } from '@/components/common/Screen';
import { DocumentUploader } from '@/components/kyc/DocumentUploader';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { UploadDocumentData } from '@/types/kyc';

type Props = NativeStackScreenProps<RootStackParamList, 'KYCVerification'>;

interface DocumentState {
  type: UploadDocumentData['type'];
  uri?: string;
  mimeType?: string;
}

export function KYCVerificationScreen({ route, navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { level } = route.params;
  const { levels, submitKYC, isLoading, error, clearError } = useKYCStore();

  const [documents, setDocuments] = useState<DocumentState[]>([]);

  const currentLevel = levels.find((l) => l.level === level);
  if (!currentLevel) {
    return null;
  }

  const getRequiredDocuments = () => {
    switch (level) {
      case 1:
        return [
          {
            type: 'ID_FRONT',
            title: 'Frente do Documento',
            description: 'Tire uma foto da frente do seu documento de identidade (RG ou CNH).',
            acceptedTypes: ['image/*'],
          },
          {
            type: 'ID_BACK',
            title: 'Verso do Documento',
            description: 'Tire uma foto do verso do seu documento de identidade.',
            acceptedTypes: ['image/*'],
          },
          {
            type: 'SELFIE',
            title: 'Selfie',
            description: 'Tire uma selfie segurando seu documento de identidade.',
            acceptedTypes: ['image/*'],
          },
        ];
      case 2:
        return [
          {
            type: 'PROOF_OF_ADDRESS',
            title: 'Comprovante de Residência',
            description: 'Envie um comprovante de residência recente (até 3 meses).',
            acceptedTypes: ['image/*', 'application/pdf'],
          },
        ];
      case 3:
        return [
          {
            type: 'PROOF_OF_INCOME',
            title: 'Comprovante de Renda',
            description: 'Envie um comprovante de renda recente (até 3 meses).',
            acceptedTypes: ['image/*', 'application/pdf'],
          },
        ];
      default:
        return [];
    }
  };

  const handleUploadDocument = async (
    type: UploadDocumentData['type'],
    uri: string,
    mimeType: string
  ) => {
    setDocuments((prev) => [
      ...prev.filter((doc) => doc.type !== type),
      { type, uri, mimeType },
    ]);
  };

  const handleSubmit = async () => {
    const requiredDocuments = getRequiredDocuments();
    const uploadedDocuments = documents.filter(
      (doc) => doc.uri && doc.mimeType
    ) as UploadDocumentData[];

    if (uploadedDocuments.length !== requiredDocuments.length) {
      // TODO: Show error message
      return;
    }

    try {
      await submitKYC({
        level,
        documents: uploadedDocuments,
      });
      navigation.goBack();
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <Screen loading={isLoading}>
      <View style={styles.container}>
        <Text
          style={[
            typography.h2,
            { color: colors.text.light },
          ]}
        >
          Verificação Nível {level}
        </Text>

        <Text
          style={[
            typography.body1,
            {
              color: colors.secondary[500],
              marginTop: spacing.sm,
            },
          ]}
        >
          {currentLevel.description}
        </Text>

        {error && (
          <Alert
            variant="error"
            message={error}
            onClose={clearError}
            style={styles.alert}
          />
        )}

        <View style={[styles.documents, { marginTop: spacing.lg }]}>
          {getRequiredDocuments().map((doc) => (
            <DocumentUploader
              key={doc.type}
              type={doc.type}
              title={doc.title}
              description={doc.description}
              acceptedTypes={doc.acceptedTypes}
              onUpload={(uri, mimeType) =>
                handleUploadDocument(doc.type, uri, mimeType)
              }
            />
          ))}
        </View>

        <Button
          onPress={handleSubmit}
          loading={isLoading}
          disabled={
            documents.length !== getRequiredDocuments().length ||
            documents.some((doc) => !doc.uri || !doc.mimeType)
          }
          style={styles.submitButton}
        >
          Enviar documentos
        </Button>
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
  documents: {},
  submitButton: {
    marginTop: 24,
  },
});
