import { useMemo } from 'react';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { User } from '@/types/users';

interface UserListProps {
  users: User[];
  sortField?: keyof User;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: keyof User) => void;
  onUserClick: (user: User) => void;
}

export function UserList({
  users,
  sortField,
  sortDirection,
  onSort,
  onUserClick,
}: UserListProps) {
  const columns = useMemo(
    () => [
      {
        key: 'name' as keyof User,
        title: 'Nome',
        sortable: true,
      },
      {
        key: 'email' as keyof User,
        title: 'Email',
        sortable: true,
      },
      {
        key: 'phone' as keyof User,
        title: 'Telefone',
        sortable: true,
      },
      {
        key: 'role' as keyof User,
        title: 'Função',
        sortable: true,
        render: (value: User['role']) => (
          <Badge
            variant={
              value === 'admin'
                ? 'error'
                : value === 'manager'
                ? 'warning'
                : 'info'
            }
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        ),
      },
      {
        key: 'kycLevel' as keyof User,
        title: 'KYC',
        sortable: true,
        render: (value: number, user: User) => (
          <Badge
            variant={
              user.kycStatus === 'APPROVED'
                ? 'success'
                : user.kycStatus === 'PENDING'
                ? 'warning'
                : user.kycStatus === 'REJECTED'
                ? 'error'
                : 'secondary'
            }
          >
            Nível {value}
          </Badge>
        ),
      },
      {
        key: 'isActive' as keyof User,
        title: 'Status',
        sortable: true,
        render: (value: boolean) => (
          <Badge variant={value ? 'success' : 'error'}>
            {value ? 'Ativo' : 'Inativo'}
          </Badge>
        ),
      },
      {
        key: 'createdAt' as keyof User,
        title: 'Criado em',
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
      data={users}
      keyExtractor={(user) => user.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onUserClick}
    />
  );
}