'use client';

import { useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionDetails } from '@/components/transactions/TransactionDetails';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { Transaction, TransactionSort } from '@/types/transactions';

export default function TransactionsPage() {
  const {
    transactions,
    selectedTransaction,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    fetchTransactions,
    fetchTransactionById,
    setFilters,
    setSort,
    setPage,
  } = useTransactionStore();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, filters, sort, pagination.page]);

  const handleSort = (field: keyof Transaction) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    } as TransactionSort);
  };

  const handleTransactionClick = async (transaction: Transaction) => {
    await fetchTransactionById(transaction.id);
    setIsDetailsModalOpen(true);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
      </div>

      <div className="space-y-6">
        <TransactionFilters filters={filters} onApplyFilters={setFilters} />

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
            <TransactionList
              transactions={transactions}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onTransactionClick={handleTransactionClick}
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
        title="Detalhes da Transação"
        size="xl"
      >
        {selectedTransaction && (
          <TransactionDetails details={selectedTransaction} />
        )}
      </Modal>
    </div>
  );
}
