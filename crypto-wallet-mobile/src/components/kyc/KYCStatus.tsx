import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { KYCRequest } from '@/types/kyc';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

interface KYCStatusProps {
  request: KYCRequest;
}

export function KYCStatus({ request }: KYCStatusProps) {
  const { colors, typography, spacing } = useTheme();

  const getStatusVariant = () => {
    switch (request.status) {
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

  const getStatusMessage = () => {
    switch (request.status) {
      case 'APPROVED':
        return 'Sua verificação foi aprovada!';
      case 'PENDING':
        return 'Sua verificação está em análise.';
      case 'REJECTED':
        return 'Sua verificação foi rejeitada.';
      default:
        return '';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            typography.h3,
            { color: colors.text.light },
          ]}
        >
          Verificação Nível {request.level}
        </Text>
        <Badge variant={getStatusVariant()} size="sm">
          {request.status}
        </Badge>
      </View>

      <Text
        style={[
          typography.body1,
          {
            color: colors.text.light,
            marginTop: spacing.sm,
          },
        ]}
      >
        {getStatusMessage()}
      </Text>

      {request.notes && (
        <Text
          style={[
            typography.body2,
            {
              color:
                request.status === 'REJECTED'
                  ? colors.error[500]
                  : colors.secondary[500],
              marginTop: spacing.xs,
            },
          ]}
        >
          {request.notes}
        </Text>
      )}

      <View style={[styles.dates, { marginTop: spacing.md }]}>
        <View style={styles.dateItem}>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            Enviado em
          </Text>
          <Text
            style={[
              typography.body2,
              {
                color: colors.text.light,
                marginTop: spacing.xxs,
              },
            ]}
          >
            {formatDate(request.createdAt)}
          </Text>
        </View>

        {request.reviewedAt && (
          <View style={styles.dateItem}>
            <Text
              style={[
                typography.caption,
                { color: colors.secondary[500] },
              ]}
            >
              Revisado em
            </Text>
            <Text
              style={[
                typography.body2,
                {
                  color: colors.text.light,
                  marginTop: spacing.xxs,
                },
              ]}
            >
              {formatDate(request.reviewedAt)}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.documents, { marginTop: spacing.md }]}>
        <Text
          style={[
            typography.body2,
            {
              color: colors.text.light,
              fontWeight: '600',
              marginBottom: spacing.xs,
            },
          ]}
        >
          Documentos enviados
        </Text>
        {request.documents.map((document) => (
          <View
            key={document.id}
            style={[
              styles.document,
              { marginTop: spacing.xs },
            ]}
          >
            <Text
              style={[
                typography.body2,
                { color: colors.text.light },
              ]}
            >
              {document.type.replace(/_/g, ' ')}
            </Text>
            <Badge variant={getStatusVariant()} size="sm">
              {document.status}
            </Badge>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {},
  documents: {},
  document: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
