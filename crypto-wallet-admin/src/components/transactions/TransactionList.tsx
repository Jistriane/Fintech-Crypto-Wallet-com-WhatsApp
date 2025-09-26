import { useMemo } from 'react';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { Transaction } from '@/types/transactions';

interface TransactionListProps {
  transactions: Transaction[];
  sortField?: keyof Transaction;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: keyof Transaction) => void;
  onTransactionClick: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  sortField,
  sortDirection,
  onSort,
  onTransactionClick,
}: TransactionListProps) {
  const columns = useMemo(
    () => [
      {
        key: 'hash' as keyof Transaction,
        title: 'Hash',
        sortable: true,
        render: (value: string) => (
          <span className="font-mono text-sm">
            {value.slice(0, 6)}...{value.slice(-4)}
          </span>
        ),
      },
      {
        key: 'type' as keyof Transaction,
        title: 'Tipo',
        sortable: true,
        render: (value: Transaction['type']) => (
          <Badge
            variant={
              value === 'SEND'
                ? 'error'
                : value === 'RECEIVE'
                ? 'success'
                : value === 'SWAP'
                ? 'warning'
                : value === 'ADD_LIQUIDITY'
                ? 'primary'
                : value === 'REMOVE_LIQUIDITY'
                ? 'secondary'
                : 'info'
            }
          >
            {value}
          </Badge>
        ),
      },
      {
        key: 'status' as keyof Transaction,
        title: 'Status',
        sortable: true,
        render: (value: Transaction['status']) => (
          <Badge
            variant={
              value === 'COMPLETED'
                ? 'success'
                : value === 'PENDING'
                ? 'warning'
                : 'error'
            }
          >
            {value}
          </Badge>
        ),
      },
      {
        key: 'amount' as keyof Transaction,
        title: 'Valor',
        sortable: true,
        render: (value: string, transaction: Transaction) => (
          <span>
            {value} {transaction.tokenSymbol}
          </span>
        ),
      },
      {
        key: 'network' as keyof Transaction,
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
        key: 'fee' as keyof Transaction,
        title: 'Taxa',
        sortable: true,
        render: (value: string, transaction: Transaction) => (
          <span className="text-sm text-gray-500">
            {value} {transaction.network}
          </span>
        ),
      },
      {
        key: 'timestamp' as keyof Transaction,
        title: 'Data',
        sortable: true,
        render: (value: string) =>
          new Date(value).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={transactions}
      keyExtractor={(transaction) => transaction.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onTransactionClick}
    />
  );
}
