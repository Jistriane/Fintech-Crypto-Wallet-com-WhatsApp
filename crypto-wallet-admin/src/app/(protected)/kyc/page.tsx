'use client';

import { useEffect } from 'react';
import { useKYCStore } from '@/store/kycStore';
import { KYCFilters } from '@/components/kyc/KYCFilters';
import { KYCList } from '@/components/kyc/KYCList';
import { KYCDetails } from '@/components/kyc/KYCDetails';
import { Modal } from '@/components/common/Modal';
import { Pagination } from '@/components/common/Pagination';
import { KYCRequest, KYCSort } from '@/types/kyc';

export default function KYCPage() {
  const {
    requests,
    selectedRequest,
    filters,
    sort,
    pagination,
    isLoading,
    error,
    fetchKYCRequests,
    fetchKYCRequestById,
    updateKYCRequest,
    updateKYCDocument,
    setFilters,
    setSort,
    setPage,
  } = useKYCStore();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchKYCRequests();
  }, [fetchKYCRequests, filters, sort, pagination.page]);

  const handleSort = (field: keyof KYCRequest) => {
    setSort({
      field,
      direction:
        sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    } as KYCSort);
  };

  const handleRequestClick = async (request: KYCRequest) => {
    await fetchKYCRequestById(request.id);
    setIsDetailsModalOpen(true);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">KYC</h1>
      </div>

      <div className="space-y-6">
        <KYCFilters filters={filters} onApplyFilters={setFilters} />

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
            <KYCList
              requests={requests}
              sortField={sort.field}
              sortDirection={sort.direction}
              onSort={handleSort}
              onRequestClick={handleRequestClick}
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
        title="Detalhes da Solicitação"
        size="xl"
      >
        {selectedRequest && (
          <KYCDetails
            details={selectedRequest}
            onUpdateRequest={updateKYCRequest}
            onUpdateDocument={updateKYCDocument}
          />
        )}
      </Modal>
    </div>
  );
}
