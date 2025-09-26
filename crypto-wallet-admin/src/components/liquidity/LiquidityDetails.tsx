import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { LineChart } from '@/components/common/LineChart';
import { LiquidityPoolDetails as LiquidityPoolDetailsType } from '@/types/liquidity';

interface LiquidityDetailsProps {
  details: LiquidityPoolDetailsType;
  onAddLiquidity: (poolId: string, token0Amount: string, token1Amount: string) => Promise<void>;
  onRemoveLiquidity: (poolId: string, positionId: string, amount: string) => Promise<void>;
  onCollectFees: (poolId: string, positionId: string) => Promise<void>;
}

export function LiquidityDetails({
  details,
  onAddLiquidity,
  onRemoveLiquidity,
  onCollectFees,
}: LiquidityDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'positions' | 'transactions'>(
    'info'
  );
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { pool, stats, positions, transactions } = details;

  const handleAddLiquidity = async () => {
    setIsSubmitting(true);
    try {
      await onAddLiquidity(pool.id, token0Amount, token1Amount);
      setToken0Amount('');
      setToken1Amount('');
    } catch (error) {
      console.error('Error adding liquidity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLiquidity = async (positionId: string) => {
    setIsSubmitting(true);
    try {
      await onRemoveLiquidity(pool.id, positionId, removeAmount);
      setRemoveAmount('');
    } catch (error) {
      console.error('Error removing liquidity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectFees = async (positionId: string) => {
    setIsSubmitting(true);
    try {
      await onCollectFees(pool.id, positionId);
    } catch (error) {
      console.error('Error collecting fees:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`${
              activeTab === 'positions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Posições
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`${
              activeTab === 'transactions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Transações
          </button>
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card title="Detalhes da Pool">
            <div className="p-4">
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rede</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        pool.network === 'ETHEREUM'
                          ? 'primary'
                          : pool.network === 'POLYGON'
                          ? 'secondary'
                          : pool.network === 'BSC'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {pool.network}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Token 0</dt>
                  <dd className="mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{pool.token0.symbol}</span>
                      <span className="text-xs text-gray-500">
                        {pool.token0.address}
                      </span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Token 1</dt>
                  <dd className="mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{pool.token1.symbol}</span>
                      <span className="text-xs text-gray-500">
                        {pool.token1.address}
                      </span>
                    </div>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Taxa</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {(pool.fee / 10000).toFixed(2)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">TVL</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${pool.tvl.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Volume 24h</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    ${pool.volume24h.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">APY</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        pool.apy >= 50
                          ? 'success'
                          : pool.apy >= 20
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {pool.apy.toFixed(2)}%
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Volume">
              <div className="p-4">
                <LineChart
                  data={stats.volumeHistory}
                  index="date"
                  categories={['volume']}
                  dataKey="volume"
                  title="Volume"
                />
              </div>
            </Card>

            <Card title="TVL">
              <div className="p-4">
                <LineChart
                  data={stats.tvlHistory}
                  index="date"
                  categories={['tvl']}
                  dataKey="tvl"
                  title="TVL"
                />
              </div>
            </Card>
          </div>

          <Card title="APY">
            <div className="p-4">
              <LineChart
                data={stats.apyHistory}
                index="date"
                categories={['apy']}
                dataKey="apy"
                title="APY"
              />
            </div>
          </Card>

          <Card title="Adicionar Liquidez">
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade {pool.token0.symbol}
                </label>
                <input
                  type="number"
                  value={token0Amount}
                  onChange={(e) => setToken0Amount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quantidade {pool.token1.symbol}
                </label>
                <input
                  type="number"
                  value={token1Amount}
                  onChange={(e) => setToken1Amount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddLiquidity}
                  disabled={isSubmitting || !token0Amount || !token1Amount}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adicionando...' : 'Adicionar Liquidez'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'positions' && (
        <Card title="Posições">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {pool.token0.symbol}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {pool.token1.symbol}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {positions.map((position) => (
                    <tr key={position.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {position.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.token0Amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {position.token1Amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(position.share * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCollectFees(position.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            Coletar Taxas
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveLiquidity(position.id)}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card title="Transações">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hash
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {pool.token0.symbol}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {pool.token1.symbol}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="font-mono">
                          {transaction.hash.slice(0, 6)}...
                          {transaction.hash.slice(-4)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge
                          variant={
                            transaction.type === 'ADD'
                              ? 'success'
                              : transaction.type === 'REMOVE'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.token0Amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.token1Amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge
                          variant={
                            transaction.status === 'COMPLETED'
                              ? 'success'
                              : transaction.status === 'PENDING'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
