import { useState } from 'react';
import { AnalyticsFilters as AnalyticsFiltersType } from '@/types/analytics';

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onApplyFilters: (filters: AnalyticsFiltersType) => void;
}

export function AnalyticsFilters({
  filters,
  onApplyFilters,
}: AnalyticsFiltersProps) {
  const [startDate, setStartDate] = useState(filters.startDate || '');
  const [endDate, setEndDate] = useState(filters.endDate || '');
  const [network, setNetwork] = useState(filters.network || '');
  const [interval, setInterval] = useState(filters.interval || 'day');

  const handleApplyFilters = () => {
    onApplyFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      network: network || undefined,
      interval: interval as AnalyticsFiltersType['interval'],
    });
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setNetwork('');
    setInterval('day');
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data Inicial
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Data Final
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
            Intervalo
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="hour">Por Hora</option>
            <option value="day">Por Dia</option>
            <option value="week">Por Semana</option>
            <option value="month">Por Mês</option>
          </select>
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
