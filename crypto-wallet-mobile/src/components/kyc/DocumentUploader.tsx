import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { KYCDocument } from '@/types/kyc';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

interface DocumentUploaderProps {
  type: KYCDocument['type'];
  title: string;
  description: string;
  acceptedTypes: string[];
  document?: KYCDocument;
  onUpload: (uri: string, mimeType: string) => Promise<void>;
}

export function DocumentUploader({
  type,
  title,
  description,
  acceptedTypes,
  document,
  onUpload,
}: DocumentUploaderProps) {
  const { colors, typography, spacing } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusVariant = () => {
    switch (document?.status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permissão de câmera necessária');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        try {
          await onUpload(result.assets[0].uri, 'image/jpeg');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      // TODO: Show error message
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: acceptedTypes,
      });

      if (result.type === 'success') {
        setIsLoading(true);
        try {
          await onUpload(result.uri, result.mimeType || 'application/octet-stream');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Error picking document:', error);
      // TODO: Show error message
    }
  };

  return (
    <Card variant="outlined" style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text
            style={[
              typography.body1,
              { color: colors.text.light, fontWeight: '600' },
            ]}
          >
            {title}
          </Text>
          {document && (
            <Badge
              variant={getStatusVariant()}
              size="sm"
              style={{ marginLeft: spacing.sm }}
            >
              {document.status}
            </Badge>
          )}
        </View>
      </View>

      <Text
        style={[
          typography.body2,
          {
            color: colors.secondary[500],
            marginTop: spacing.xs,
          },
        ]}
      >
        {description}
      </Text>

      {document?.url ? (
        <View style={[styles.preview, { marginTop: spacing.md }]}>
          <Image
            source={{ uri: document.url }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          {document.status === 'REJECTED' && document.notes && (
            <Text
              style={[
                typography.caption,
                {
                  color: colors.error[500],
                  marginTop: spacing.sm,
                },
              ]}
            >
              {document.notes}
            </Text>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.actions,
            { marginTop: spacing.md },
          ]}
        >
          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={isLoading}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.primary[500],
                marginRight: spacing.sm,
              },
            ]}
          >
            <Ionicons
              name="camera"
              size={20}
              color={colors.text.light}
            />
            <Text
              style={[
                typography.body2,
                {
                  color: colors.text.light,
                  marginLeft: spacing.xs,
                  fontWeight: '600',
                },
              ]}
            >
              Tirar foto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickDocument}
            disabled={isLoading}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.background.light,
                borderWidth: 1,
                borderColor: colors.primary[500],
              },
            ]}
          >
            <Ionicons
              name="document"
              size={20}
              color={colors.primary[500]}
            />
            <Text
              style={[
                typography.body2,
                {
                  color: colors.primary[500],
                  marginLeft: spacing.xs,
                  fontWeight: '600',
                },
              ]}
            >
              Escolher arquivo
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  preview: {},
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});
