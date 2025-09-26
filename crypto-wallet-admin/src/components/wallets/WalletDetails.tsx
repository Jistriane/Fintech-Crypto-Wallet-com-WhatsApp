import { useState } from 'react';
import { Wallet, TokenBalance, WalletTransaction, WalletActivity } from '@/types/wallets';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface WalletDetailsProps {
  wallet: Wallet;
  balances: TokenBalance[];
  transactions: WalletTransaction[];
  activity: WalletActivity[];
}

export function WalletDetails({
  wallet,
  balances,
  transactions,
  activity,
}: WalletDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'balances' | 'transactions' | 'activity'>(
    'info'
  );

  const totalBalance = balances.reduce(
    (acc, balance) => acc + parseFloat(balance.usdValue),
    0
  );

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
            onClick={() => setActiveTab('balances')}
            className={`${
              activeTab === 'balances'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Saldos
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
          <button
            onClick={() => setActiveTab('activity')}
            className={`${
              activeTab === 'activity'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Atividade
          </button>
        </nav>
      </div>

      {activeTab === 'info' && (
        <Card title="Informações da Carteira">
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Endereço</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {wallet.address}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rede</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    wallet.network === 'ETHEREUM'
                      ? 'primary'
                      : wallet.network === 'POLYGON'
                      ? 'secondary'
                      : wallet.network === 'BSC'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {wallet.network}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant={wallet.isActive ? 'success' : 'error'}>
                  {wallet.isActive ? 'Ativa' : 'Inativa'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Última Atividade
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {wallet.lastActivity
                  ? new Date(wallet.lastActivity).toLocaleString('pt-BR')
                  : 'Nunca'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Criada em</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(wallet.createdAt).toLocaleString('pt-BR')}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      {activeTab === 'balances' && (
        <Card title={`Saldos (Total: $${totalBalance.toLocaleString()})`}>
          <div className="space-y-4">
            {balances.map((balance) => (
              <div
                key={balance.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {balance.tokenName} ({balance.tokenSymbol})
                  </p>
                  <p className="text-sm text-gray-500">
                    {balance.balance} {balance.tokenSymbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${parseFloat(balance.usdValue).toLocaleString()}
                  </p>
                  <Badge variant="secondary">{balance.network}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card title="Transações">
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        tx.type === 'SEND'
                          ? 'error'
                          : tx.type === 'RECEIVE'
                          ? 'success'
                          : 'info'
                      }
                    >
                      {tx.type}
                    </Badge>
                    <Badge
                      variant={
                        tx.status === 'COMPLETED'
                          ? 'success'
                          : tx.status === 'PENDING'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {tx.amount} {tx.tokenSymbol}
                  </p>
                  <p className="text-xs text-gray-400">
                    Taxa: {tx.fee} {tx.network}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs font-mono text-gray-400">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card title="Histórico de Atividades">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activity.map((item, itemIdx) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== activity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            item.type === 'TRANSACTION'
                              ? 'bg-green-500'
                              : item.type === 'BALANCE_UPDATE'
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                        >
                          <span className="text-white text-xs">
                            {item.type.charAt(0)}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
