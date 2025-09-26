'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { WalletFilters } from '@/components/wallets/WalletFilters';
import { WalletList } from '@/components/wallets/WalletList';
import { WalletForm } from '@/components/wallets/WalletForm';
import { WalletDetails } from '@/components/wallets/WalletDetails';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { Wallet, WalletSort } from '@/types/wallets';

export default function WalletsPage() {
  const {
    wallets,
    selectedWallet,
    walletBalances,
    walletTransactions,
    walletActivity,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    fetchWallets,
    fetchWalletById,
    fetchWalletBalances,
    fetchWalletTransactions,
    fetchWalletActivity,
    createWallet,
    updateWallet,
    setFilters,
    setSort,
    setPage,
  } = useWalletStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets, filters, sort, pagination.page]);

  const handleSort = (field: keyof Wallet) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    } as WalletSort);
  };

  const handleWalletClick = async (wallet: Wallet) => {
    await Promise.all([
      fetchWalletById(wallet.id),
      fetchWalletBalances(wallet.id),
      fetchWalletTransactions(wallet.id),
      fetchWalletActivity(wallet.id),
    ]);
    setIsDetailsModalOpen(true);
  };

  const handleCreateWallet = async (data: any) => {
    try {
      await createWallet(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };

  const handleUpdateWallet = async (data: any) => {
    if (!selectedWallet) return;
    try {
      await updateWallet(selectedWallet.id, data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Carteiras</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Nova Carteira
        </button>
      </div>

      <div className="space-y-6">
        <WalletFilters filters={filters} onApplyFilters={setFilters} />

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
            <WalletList
              wallets={wallets}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onWalletClick={handleWalletClick}
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
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Carteira"
      >
        <WalletForm
          onSubmit={handleCreateWallet}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Carteira"
      >
        {selectedWallet && (
          <WalletForm
            wallet={selectedWallet}
            onSubmit={handleUpdateWallet}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Detalhes da Carteira"
        size="xl"
      >
        {selectedWallet && walletBalances && walletTransactions && walletActivity && (
          <div className="space-y-4">
            <WalletDetails
              wallet={selectedWallet}
              balances={walletBalances}
              transactions={walletTransactions}
              activity={walletActivity}
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Editar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
