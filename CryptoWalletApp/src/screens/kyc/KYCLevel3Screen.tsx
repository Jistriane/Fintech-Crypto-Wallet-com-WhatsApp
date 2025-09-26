import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KYCStackParamList } from '../../navigation/types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { DocumentUpload } from '../../components/kyc/DocumentUpload';
import useKYCStore from '../../store/kycStore';

type KYCLevel3ScreenNavigationProp = NativeStackNavigationProp<KYCStackParamList, 'KYCLevel3'>;

export const KYCLevel3Screen = () => {
  const navigation = useNavigation<KYCLevel3ScreenNavigationProp>();
  const {
    requirements,
    isLoading,
    loadKYCRequirements,
    submitKYC,
    uploadDocument,
  } = useKYCStore();

  const [personalInfo, setPersonalInfo] = useState({
    assets: {
      realEstate: '',
      vehicles: '',
      investments: '',
      otherAssets: '',
    },
    financialProfile: {
      expectedMonthlyVolume: '',
      expectedTransactionTypes: [] as string[],
      cryptoExperience: '',
      riskTolerance: '',
    },
    taxInfo: {
      taxId: '',
      taxResidence: '',
      taxDeclarationUrl: '',
    },
  });

  const [documents, setDocuments] = useState<{
    type: string;
    imageUri: string;
    status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  }[]>([]);

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadKYCRequirements(3);
      } catch (error) {
        Alert.alert(
          'Erro',
          error instanceof Error ? error.message : 'Erro ao carregar requisitos do KYC'
        );
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!personalInfo.assets.realEstate) {
      newErrors.realEstate = 'Valor dos imóveis é obrigatório';
    }

    if (!personalInfo.assets.investments) {
      newErrors.investments = 'Valor dos investimentos é obrigatório';
    }

    if (!personalInfo.financialProfile.expectedMonthlyVolume) {
      newErrors.expectedMonthlyVolume = 'Volume mensal esperado é obrigatório';
    }

    if (personalInfo.financialProfile.expectedTransactionTypes.length === 0) {
      newErrors.expectedTransactionTypes = 'Selecione pelo menos um tipo de transação';
    }

    if (!personalInfo.taxInfo.taxId) {
      newErrors.taxId = 'Número de identificação fiscal é obrigatório';
    }

    if (!personalInfo.taxInfo.taxResidence) {
      newErrors.taxResidence = 'Residência fiscal é obrigatória';
    }

    if (documents.length === 0) {
      newErrors.documents = 'Documentos são obrigatórios';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocumentUpload = async (type: string, imageUri: string) => {
    try {
      const documentId = await uploadDocument(type, imageUri);
      setDocuments((prev) => [
        ...prev,
        {
          type,
          imageUri,
          status: 'PENDING',
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao enviar documento'
      );
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await submitKYC({
        level: 3,
        documents,
        personalInfo,
      });

      Alert.alert(
        'Sucesso',
        'Documentos enviados com sucesso! Você receberá uma notificação no WhatsApp quando a análise for concluída.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('KYCStatus'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao enviar documentos'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <Text style={styles.title}>Verificação Nível 3</Text>
          <Text style={styles.subtitle}>
            Complete as informações patrimoniais e fiscais para obter os limites máximos
          </Text>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Patrimônio</Text>

          <Input
            label="Valor Total em Imóveis"
            value={personalInfo.assets.realEstate}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                assets: { ...prev.assets, realEstate: text },
              }));
              setErrors((prev) => ({ ...prev, realEstate: '' }));
            }}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.realEstate}
          />

          <Input
            label="Valor Total em Veículos"
            value={personalInfo.assets.vehicles}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                assets: { ...prev.assets, vehicles: text },
              }));
            }}
            placeholder="0.00"
            keyboardType="numeric"
          />

          <Input
            label="Valor Total em Investimentos"
            value={personalInfo.assets.investments}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                assets: { ...prev.assets, investments: text },
              }));
              setErrors((prev) => ({ ...prev, investments: '' }));
            }}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.investments}
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Perfil Financeiro</Text>

          <Input
            label="Volume Mensal Esperado"
            value={personalInfo.financialProfile.expectedMonthlyVolume}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                financialProfile: {
                  ...prev.financialProfile,
                  expectedMonthlyVolume: text,
                },
              }));
              setErrors((prev) => ({ ...prev, expectedMonthlyVolume: '' }));
            }}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.expectedMonthlyVolume}
          />

          <Input
            label="Experiência com Criptomoedas (anos)"
            value={personalInfo.financialProfile.cryptoExperience}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                financialProfile: {
                  ...prev.financialProfile,
                  cryptoExperience: text,
                },
              }));
            }}
            placeholder="0"
            keyboardType="numeric"
          />
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações Fiscais</Text>

          <Input
            label="Número de Identificação Fiscal"
            value={personalInfo.taxInfo.taxId}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                taxInfo: { ...prev.taxInfo, taxId: text },
              }));
              setErrors((prev) => ({ ...prev, taxId: '' }));
            }}
            error={errors.taxId}
          />

          <Input
            label="País de Residência Fiscal"
            value={personalInfo.taxInfo.taxResidence}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                taxInfo: { ...prev.taxInfo, taxResidence: text },
              }));
              setErrors((prev) => ({ ...prev, taxResidence: '' }));
            }}
            error={errors.taxResidence}
          />
        </Card>

        <Card style={styles.documentsCard}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <Text style={styles.documentsDescription}>
            Envie os documentos fiscais e comprovantes solicitados
          </Text>

          <DocumentUpload
            title="Declaração de Imposto de Renda"
            description="Envie a última declaração de IR completa"
            onUpload={(imageUri) => handleDocumentUpload('TAX_DECLARATION', imageUri)}
          />

          <DocumentUpload
            title="Comprovante de Endereço Internacional"
            description="Envie um comprovante de endereço do país de residência fiscal"
            onUpload={(imageUri) => handleDocumentUpload('FOREIGN_ADDRESS_PROOF', imageUri)}
          />

          <DocumentUpload
            title="Comprovantes de Renda Adicionais"
            description="Envie documentos que comprovem outras fontes de renda"
            onUpload={(imageUri) => handleDocumentUpload('ADDITIONAL_INCOME_PROOF', imageUri)}
          />
        </Card>

        <Button
          title="Enviar Documentos"
          onPress={handleSubmit}
          loading={isLoading}
          style={styles.submitButton}
        />
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
  infoCard: {
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
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  documentsCard: {
    marginBottom: 16,
  },
  documentsDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  submitButton: {
    marginBottom: 24,
  },
});
