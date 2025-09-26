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

type KYCLevel1ScreenNavigationProp = NativeStackNavigationProp<KYCStackParamList, 'KYCLevel1'>;

export const KYCLevel1Screen = () => {
  const navigation = useNavigation<KYCLevel1ScreenNavigationProp>();
  const {
    requirements,
    isLoading,
    loadKYCRequirements,
    submitKYC,
    uploadDocument,
  } = useKYCStore();

  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    birthDate: '',
    nationality: '',
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
    documents: [{
      type: 'CPF',
      number: '',
      issueDate: '',
      issuer: '',
    }],
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
        await loadKYCRequirements(1);
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

    if (!personalInfo.fullName) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!personalInfo.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(personalInfo.birthDate)) {
      newErrors.birthDate = 'Data inválida (use DD/MM/AAAA)';
    }

    if (!personalInfo.documents[0].number) {
      newErrors.documentNumber = 'Número do documento é obrigatório';
    }

    if (!personalInfo.address.postalCode) {
      newErrors.postalCode = 'CEP é obrigatório';
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
        level: 1,
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
          <Text style={styles.title}>Verificação Nível 1</Text>
          <Text style={styles.subtitle}>
            Complete as informações abaixo para aumentar seus limites de transação
          </Text>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <Input
            label="Nome Completo"
            value={personalInfo.fullName}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({ ...prev, fullName: text }));
              setErrors((prev) => ({ ...prev, fullName: '' }));
            }}
            error={errors.fullName}
          />

          <Input
            label="Data de Nascimento"
            value={personalInfo.birthDate}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({ ...prev, birthDate: text }));
              setErrors((prev) => ({ ...prev, birthDate: '' }));
            }}
            placeholder="DD/MM/AAAA"
            error={errors.birthDate}
          />

          <Input
            label="CPF"
            value={personalInfo.documents[0].number}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                documents: [{ ...prev.documents[0], number: text }],
              }));
              setErrors((prev) => ({ ...prev, documentNumber: '' }));
            }}
            placeholder="000.000.000-00"
            error={errors.documentNumber}
          />

          <Input
            label="CEP"
            value={personalInfo.address.postalCode}
            onChangeText={(text) => {
              setPersonalInfo((prev) => ({
                ...prev,
                address: { ...prev.address, postalCode: text },
              }));
              setErrors((prev) => ({ ...prev, postalCode: '' }));
            }}
            placeholder="00000-000"
            error={errors.postalCode}
          />
        </Card>

        <Card style={styles.documentsCard}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          <Text style={styles.documentsDescription}>
            Envie fotos claras e legíveis dos documentos solicitados
          </Text>

          <DocumentUpload
            title="RG ou CNH (Frente)"
            description="Envie uma foto da frente do seu documento de identificação"
            onUpload={(imageUri) => handleDocumentUpload('ID_FRONT', imageUri)}
          />

          <DocumentUpload
            title="RG ou CNH (Verso)"
            description="Envie uma foto do verso do seu documento de identificação"
            onUpload={(imageUri) => handleDocumentUpload('ID_BACK', imageUri)}
          />

          <DocumentUpload
            title="Selfie com Documento"
            description="Tire uma selfie segurando seu documento ao lado do rosto"
            onUpload={(imageUri) => handleDocumentUpload('SELFIE_WITH_ID', imageUri)}
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
