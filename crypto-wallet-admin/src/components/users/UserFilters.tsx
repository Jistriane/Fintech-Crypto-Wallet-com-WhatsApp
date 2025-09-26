import { useState } from 'react';
import { UserFilters as UserFiltersType } from '@/types/users';

interface UserFiltersProps {
  filters: UserFiltersType;
  onApplyFilters: (filters: UserFiltersType) => void;
}

export function UserFilters({ filters, onApplyFilters }: UserFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [role, setRole] = useState(filters.role || '');
  const [kycLevel, setKycLevel] = useState(filters.kycLevel?.toString() || '');
  const [kycStatus, setKycStatus] = useState(filters.kycStatus || '');
  const [isActive, setIsActive] = useState(filters.isActive);

  const handleApplyFilters = () => {
    onApplyFilters({
      search: search || undefined,
      role: role as any || undefined,
      kycLevel: kycLevel ? parseInt(kycLevel) : undefined,
      kycStatus: kycStatus as any || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('');
    setKycLevel('');
    setKycStatus('');
    setIsActive(undefined);
    onApplyFilters({});
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Buscar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, email ou telefone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Função
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Todas</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nível KYC
          </label>
          <select
            value={kycLevel}
            onChange={(e) => setKycLevel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="0">Nível 0</option>
            <option value="1">Nível 1</option>
            <option value="2">Nível 2</option>
            <option value="3">Nível 3</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status KYC
          </label>
          <select
            value={kycStatus}
            onChange={(e) => setKycStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="APPROVED">Aprovado</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="NOT_SUBMITTED">Não Enviado</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Apenas ativos</span>
        </label>
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
