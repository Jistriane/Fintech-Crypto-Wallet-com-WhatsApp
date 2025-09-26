import { useMemo } from 'react';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { KYCRequest } from '@/types/kyc';

interface KYCListProps {
  requests: KYCRequest[];
  sortField?: keyof KYCRequest;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: keyof KYCRequest) => void;
  onRequestClick: (request: KYCRequest) => void;
}

export function KYCList({
  requests,
  sortField,
  sortDirection,
  onSort,
  onRequestClick,
}: KYCListProps) {
  const columns = useMemo(
    () => [
      {
        key: 'userId' as keyof KYCRequest,
        title: 'ID do Usuário',
        sortable: true,
      },
      {
        key: 'level' as keyof KYCRequest,
        title: 'Nível',
        sortable: true,
        render: (value: number) => (
          <Badge variant="primary">Nível {value}</Badge>
        ),
      },
      {
        key: 'status' as keyof KYCRequest,
        title: 'Status',
        sortable: true,
        render: (value: KYCRequest['status']) => (
          <Badge
            variant={
              value === 'APPROVED'
                ? 'success'
                : value === 'PENDING'
                ? 'warning'
                : 'error'
            }
          >
            {value === 'APPROVED'
              ? 'Aprovado'
              : value === 'PENDING'
              ? 'Pendente'
              : 'Rejeitado'}
          </Badge>
        ),
      },
      {
        key: 'documents' as keyof KYCRequest,
        title: 'Documentos',
        sortable: false,
        render: (value: KYCRequest['documents']) => (
          <div className="flex flex-wrap gap-1">
            {value.map((doc) => (
              <Badge
                key={doc.id}
                variant={
                  doc.status === 'APPROVED'
                    ? 'success'
                    : doc.status === 'PENDING'
                    ? 'warning'
                    : 'error'
                }
              >
                {doc.type.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        key: 'createdAt' as keyof KYCRequest,
        title: 'Criado em',
        sortable: true,
        render: (value: string) =>
          new Date(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
      },
      {
        key: 'reviewedAt' as keyof KYCRequest,
        title: 'Revisado em',
        sortable: true,
        render: (value: string | undefined) =>
          value
            ? new Date(value).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '-',
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={requests}
      keyExtractor={(request) => request.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onRequestClick}
    />
  );
}
