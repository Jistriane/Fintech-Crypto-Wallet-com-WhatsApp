import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

interface DocumentUploadProps {
  title: string;
  description: string;
  onUpload: (imageUri: string) => void;
  loading?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  description,
  onUpload,
  loading = false
}) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    if (result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      onUpload(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
    });

    if (result.assets && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      onUpload(result.assets[0].uri);
    }
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
          <Button
            title="Tirar Nova Foto"
            onPress={handleTakePhoto}
            variant="outline"
            style={styles.retakeButton}
            loading={loading}
          />
        </View>
      ) : (
        <View style={styles.uploadOptions}>
          <Button
            title="Tirar Foto"
            onPress={handleTakePhoto}
            style={styles.uploadButton}
            loading={loading}
          />
          <Button
            title="Escolher da Galeria"
            onPress={handleSelectImage}
            variant="outline"
            style={styles.uploadButton}
            loading={loading}
          />
        </View>
      )}

      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>Dicas para uma boa foto:</Text>
        <Text style={styles.guidelineItem}>• Ambiente bem iluminado</Text>
        <Text style={styles.guidelineItem}>• Documento totalmente visível</Text>
        <Text style={styles.guidelineItem}>• Sem reflexos ou brilhos</Text>
        <Text style={styles.guidelineItem}>• Fundo escuro</Text>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  uploadOptions: {
    marginBottom: 16,
  },
  uploadButton: {
    marginBottom: 8,
  },
  imageContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  retakeButton: {
    width: '100%',
  },
  guidelines: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});
