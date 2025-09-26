import { useMemo } from 'react';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { LiquidityPool } from '@/types/liquidity';

interface LiquidityListProps {
  pools: LiquidityPool[];
  sortField?: keyof LiquidityPool;
  sortDirection?: 'asc' | 'desc';
  onSort: (field: keyof LiquidityPool) => void;
  onPoolClick: (pool: LiquidityPool) => void;
}

export function LiquidityList({
  pools,
  sortField,
  sortDirection,
  onSort,
  onPoolClick,
}: LiquidityListProps) {
  const columns = useMemo(
    () => [
      {
        key: 'network' as keyof LiquidityPool,
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
        key: 'token0' as keyof LiquidityPool,
        title: 'Token 0',
        sortable: false,
        render: (value: LiquidityPool['token0']) => (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{value.symbol}</span>
            <span className="text-xs text-gray-500">
              {value.address.slice(0, 6)}...{value.address.slice(-4)}
            </span>
          </div>
        ),
      },
      {
        key: 'token1' as keyof LiquidityPool,
        title: 'Token 1',
        sortable: false,
        render: (value: LiquidityPool['token1']) => (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{value.symbol}</span>
            <span className="text-xs text-gray-500">
              {value.address.slice(0, 6)}...{value.address.slice(-4)}
            </span>
          </div>
        ),
      },
      {
        key: 'fee' as keyof LiquidityPool,
        title: 'Taxa',
        sortable: true,
        render: (value: number) => `${(value / 10000).toFixed(2)}%`,
      },
      {
        key: 'tvl' as keyof LiquidityPool,
        title: 'TVL',
        sortable: true,
        render: (value: number) => `$${value.toLocaleString()}`,
      },
      {
        key: 'volume24h' as keyof LiquidityPool,
        title: 'Volume 24h',
        sortable: true,
        render: (value: number) => `$${value.toLocaleString()}`,
      },
      {
        key: 'apy' as keyof LiquidityPool,
        title: 'APY',
        sortable: true,
        render: (value: number) => (
          <Badge
            variant={
              value >= 50
                ? 'success'
                : value >= 20
                ? 'warning'
                : 'secondary'
            }
          >
            {value.toFixed(2)}%
          </Badge>
        ),
      },
      {
        key: 'totalSupply' as keyof LiquidityPool,
        title: 'Total Supply',
        sortable: true,
        render: (value: string) => value,
      },
      {
        key: 'createdAt' as keyof LiquidityPool,
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
      data={pools}
      keyExtractor={(pool) => pool.id}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={onSort}
      onRowClick={onPoolClick}
    />
  );
}
