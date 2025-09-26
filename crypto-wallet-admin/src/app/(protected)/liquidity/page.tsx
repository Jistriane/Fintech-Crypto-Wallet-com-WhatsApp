'use client';

import { useEffect } from 'react';
import { useLiquidityStore } from '@/store/liquidityStore';
import { LiquidityFilters } from '@/components/liquidity/LiquidityFilters';
import { LiquidityList } from '@/components/liquidity/LiquidityList';
import { LiquidityDetails } from '@/components/liquidity/LiquidityDetails';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { LiquidityPool, LiquiditySort } from '@/types/liquidity';

export default function LiquidityPage() {
  const {
    pools,
    selectedPool,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    fetchLiquidityPools,
    fetchLiquidityPoolById,
    addLiquidity,
    removeLiquidity,
    collectFees,
    setFilters,
    setSort,
    setPage,
  } = useLiquidityStore();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchLiquidityPools();
  }, [fetchLiquidityPools, filters, sort, pagination.page]);

  const handleSort = (field: keyof LiquidityPool) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    } as LiquiditySort);
  };

  const handlePoolClick = async (pool: LiquidityPool) => {
    await fetchLiquidityPoolById(pool.id);
    setIsDetailsModalOpen(true);
  };

  const handleAddLiquidity = async (
    poolId: string,
    token0Amount: string,
    token1Amount: string
  ) => {
    await addLiquidity({ poolId, token0Amount, token1Amount });
  };

  const handleRemoveLiquidity = async (
    poolId: string,
    positionId: string,
    amount: string
  ) => {
    await removeLiquidity({ poolId, positionId, amount });
  };

  const handleCollectFees = async (poolId: string, positionId: string) => {
    await collectFees({ poolId, positionId });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pools de Liquidez</h1>
      </div>

      <div className="space-y-6">
        <LiquidityFilters filters={filters} onApplyFilters={setFilters} />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <LiquidityList
              pools={pools}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onPoolClick={handlePoolClick}
            />

            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes da Pool"
        size="xl"
      >
        {selectedPool && (
          <LiquidityDetails
            details={selectedPool}
            onAddLiquidity={handleAddLiquidity}
            onRemoveLiquidity={handleRemoveLiquidity}
            onCollectFees={handleCollectFees}
          />
        )}
      </Modal>
    </div>
  );
}
