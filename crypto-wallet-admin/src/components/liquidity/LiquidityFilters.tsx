import { useState } from 'react';
import { LiquidityFilters as LiquidityFiltersType } from '@/types/liquidity';

interface LiquidityFiltersProps {
  filters: LiquidityFiltersType;
  onApplyFilters: (filters: LiquidityFiltersType) => void;
}

export function LiquidityFilters({
  filters,
  onApplyFilters,
}: LiquidityFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [network, setNetwork] = useState(filters.network || '');
  const [minTvl, setMinTvl] = useState(filters.minTvl?.toString() || '');
  const [minApy, setMinApy] = useState(filters.minApy?.toString() || '');
  const [token, setToken] = useState(filters.token || '');

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      network: network || undefined,
      minTvl: minTvl ? parseFloat(minTvl) : undefined,
      minApy: minApy ? parseFloat(minApy) : undefined,
      token: token || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setNetwork('');
    setMinTvl('');
    setMinApy('');
    setToken('');
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Token ou pool"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            TVL Mínimo
          </label>
          <input
            type="number"
            value={minTvl}
            onChange={(e) => setMinTvl(e.target.value)}
            placeholder="Ex: 10000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            APY Mínimo
          </label>
          <input
            type="number"
            value={minApy}
            onChange={(e) => setMinApy(e.target.value)}
            placeholder="Ex: 5"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Token
          </label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Ex: USDC"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
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
