import { useMemo } from 'react';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Wallet } from '@/types/wallets';

interface WalletListProps {
  wallets: Wallet[];
  sortField?: keyof Wallet;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: keyof Wallet) => void;
  onWalletClick: (wallet: Wallet) => void;
}

export function WalletList({
  wallets,
  sortField,
  sortDirection,
  onSort,
  onWalletClick,
}: WalletListProps) {
  const columns = useMemo(
    () => [
      {
        key: 'address',
        title: 'Endereço',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-sm">
            {value.slice(0, 6)}...{value.slice(-4)}
          </span>
        ),
      },
      {
        key: 'network',
        title: 'Rede',
        sortable: true,
        render: (value: string) => (
          <Badge
            variant={
              value === 'ETHEREUM'
                ? 'primary'
                : value === 'POLYGON'
                ? 'secondary'
                : value === 'BSC'
                ? 'warning'
                : 'info'
            }
          >
            {value}
          </Badge>
        ),
      },
      {
        key: 'isActive',
        title: 'Status',
        sortable: true,
        render: (value: boolean) => (
          <Badge variant={value ? 'success' : 'error'}>
            {value ? 'Ativa' : 'Inativa'}
          </Badge>
        ),
      },
      {
        key: 'lastActivity',
        title: 'Última Atividade',
        sortable: true,
        render: (value: string) =>
          value
            ? new Date(value).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Nunca',
      },
      {
        key: 'createdAt',
        title: 'Criada em',
        sortable: true,
        render: (value: string) =>
          new Date(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }),
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={wallets}
      keyExtractor={(wallet) => wallet.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onWalletClick}
    />
  );
}
