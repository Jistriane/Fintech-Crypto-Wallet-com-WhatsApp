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

type KYCLevel2ScreenNavigationProp = NativeStackNavigationProp<KYCStackParamList, 'KYCLevel2'>;

export const KYCLevel2Screen = () => {
  const navigation = useNavigation<KYCLevel2ScreenNavigationProp>();
  const {
    requirements,
    isLoading,
    loadKYCRequirements,
    submitKYC,
    uploadDocument,
  } = useKYCStore();

  const [personalInfo, setPersonalInfo] = useState({
    occupation: '',
    income: {
      source: '',
      monthlyAmount: '',
      currency: 'BRL',
    },
    employer: {
      name: '',
      phone: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
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
        await loadKYCRequirements(2);
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

    if (!personalInfo.occupation) {
      newErrors.occupation = 'Profissão é obrigatória';
    }

    if (!personalInfo.income.source) {
      newErrors.incomeSource = 'Fonte de renda é obrigatória';
    }

    if (!personalInfo.income.monthlyAmount) {
      newErrors.monthlyAmount = 'Renda mensal é obrigatória';
    } else if (isNaN(parseFloat(personalInfo.income.monthlyAmount))) {
      newErrors.monthlyAmount = 'Valor inválido';
    }

    if (!personalInfo.employer.name) {
      newErrors.employerName = 'Nome do empregador é obrigatório';
    }

    if (!personalInfo.employer.phone) {
      newErrors.employerPhone = 'Telefone do empregador é obrigatório';
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
        level: 2,
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
          <Text style={styles.title}>Verificação Nível 2</Text>
          <Text style={styles.subtitle}>
            Complete as informações profissionais e financeiras para aumentar seus limites
          </Text>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações Profissionais</Text>

          <Input
            label="Profissão"
            value={personalInfo.occupation}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({ ...prev, occupation: text }));
              setErrors((prev) => ({ ...prev, occupation: '' }));
            }}
            error={errors.occupation}
          />

          <Input
            label="Fonte de Renda"
            value={personalInfo.income.source}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                income: { ...prev.income, source: text },
              }));
              setErrors((prev) => ({ ...prev, incomeSource: '' }));
            }}
            error={errors.incomeSource}
          />

          <Input
            label="Renda Mensal"
            value={personalInfo.income.monthlyAmount}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                income: { ...prev.income, monthlyAmount: text },
              }));
              setErrors((prev) => ({ ...prev, monthlyAmount: '' }));
            }}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.monthlyAmount}
          />

          <Input
            label="Nome do Empregador"
            value={personalInfo.employer.name}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                employer: { ...prev.employer, name: text },
              }));
              setErrors((prev) => ({ ...prev, employerName: '' }));
            }}
            error={errors.employerName}
          />

          <Input
            label="Telefone do Empregador"
            value={personalInfo.employer.phone}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                employer: { ...prev.employer, phone: text },
              }));
              setErrors((prev) => ({ ...prev, employerPhone: '' }));
            }}
            placeholder="+55 (00) 00000-0000"
            error={errors.employerPhone}
          />
        </Card>

        <Card style={styles.documentsCard}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <Text style={styles.documentsDescription}>
            Envie os comprovantes solicitados
          </Text>

          <DocumentUpload
            title="Comprovante de Renda"
            description="Envie um holerite, declaração de IR ou extrato bancário dos últimos 3 meses"
            onUpload={(imageUri) => handleDocumentUpload('INCOME_PROOF', imageUri)}
          />

          <DocumentUpload
            title="Comprovante de Residência"
            description="Envie uma conta de luz, água ou telefone em seu nome"
            onUpload={(imageUri) => handleDocumentUpload('ADDRESS_PROOF', imageUri)}
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
