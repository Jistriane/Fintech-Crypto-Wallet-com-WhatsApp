import { useState } from 'react';
import { TransactionDetails as TransactionDetailsType } from '@/types/transactions';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface TransactionDetailsProps {
  details: TransactionDetailsType;
}

export function TransactionDetails({ details }: TransactionDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'events' | 'receipt'>(
    'info'
  );

  const { transaction, events, receipt } = details;

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
            onClick={() => setActiveTab('events')}
            className={`${
              activeTab === 'events'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Eventos
          </button>
          {receipt && (
            <button
              onClick={() => setActiveTab('receipt')}
              className={`${
                activeTab === 'receipt'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
            >
              Recibo
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'info' && (
        <Card title="Detalhes da Transação">
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Hash</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {transaction.hash}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    transaction.type === 'SEND'
                      ? 'error'
                      : transaction.type === 'RECEIVE'
                      ? 'success'
                      : transaction.type === 'SWAP'
                      ? 'warning'
                      : transaction.type === 'ADD_LIQUIDITY'
                      ? 'primary'
                      : transaction.type === 'REMOVE_LIQUIDITY'
                      ? 'secondary'
                      : 'info'
                  }
                >
                  {transaction.type}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
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
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">De</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {transaction.from}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Para</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {transaction.to}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Valor</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction.amount} {transaction.tokenSymbol}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rede</dt>
              <dd className="mt-1">
                <Badge
                  variant={
                    transaction.network === 'ETHEREUM'
                      ? 'primary'
                      : transaction.network === 'POLYGON'
                      ? 'secondary'
                      : transaction.network === 'BSC'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {transaction.network}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Taxa</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {transaction.fee} {transaction.network}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Data</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(transaction.timestamp).toLocaleString('pt-BR')}
              </dd>
            </div>
            {transaction.blockNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Bloco
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.blockNumber}
                </dd>
              </div>
            )}
            {transaction.confirmations && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Confirmações
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {transaction.confirmations}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      {activeTab === 'events' && (
        <Card title="Histórico de Eventos">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {events.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== events.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            event.type === 'CREATED'
                              ? 'bg-blue-500'
                              : event.type === 'STATUS_UPDATED'
                              ? 'bg-yellow-500'
                              : event.type === 'CONFIRMED'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }`}
                        >
                          <span className="text-white text-xs">
                            {event.type.charAt(0)}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {event.description}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {new Date(event.createdAt).toLocaleString('pt-BR')}
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

      {activeTab === 'receipt' && receipt && (
        <Card title="Recibo da Transação">
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Hash do Bloco</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900">
                {receipt.blockHash}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Número do Bloco
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {receipt.blockNumber}
              </dd>
            </div>
            {receipt.contractAddress && (
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Endereço do Contrato
                </dt>
                <dd className="mt-1 text-sm font-mono text-gray-900">
                  {receipt.contractAddress}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Gas Utilizado
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {receipt.gasUsed}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Preço Efetivo do Gas
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {receipt.effectiveGasPrice}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Status
              </dt>
              <dd className="mt-1">
                <Badge variant={receipt.status ? 'success' : 'error'}>
                  {receipt.status ? 'Sucesso' : 'Falha'}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
