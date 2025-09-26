import { useState } from 'react';
import { WalletFilters as WalletFiltersType } from '@/types/wallets';

interface WalletFiltersProps {
  filters: WalletFiltersType;
  onApplyFilters: (filters: WalletFiltersType) => void;
}

export function WalletFilters({ filters, onApplyFilters }: WalletFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [network, setNetwork] = useState(filters.network || '');
  const [isActive, setIsActive] = useState(filters.isActive);

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      network: network || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setNetwork('');
    setIsActive(undefined);
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Endereço ou ID"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rede
          </label>
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Todas</option>
            <option value="ETHEREUM">Ethereum</option>
            <option value="POLYGON">Polygon</option>
            <option value="BSC">BSC</option>
            <option value="ARBITRUM">Arbitrum</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Apenas ativas</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleClearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Limpar
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
