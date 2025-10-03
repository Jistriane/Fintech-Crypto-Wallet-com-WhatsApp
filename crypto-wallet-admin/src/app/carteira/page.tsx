'use client';

import { useState } from 'react';
import { useAccount, useBalance, useChainId, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CarteiraPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { writeContractAsync } = useWriteContract();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error('Endereço de destinatário inválido');
      }

      const value = parseFloat(amount);
      if (isNaN(value) || value <= 0) {
        throw new Error('Valor inválido');
      }

      const balanceInEth = balance ? parseFloat(formatEther(balance.value)) : 0;
      if (value > balanceInEth) {
        throw new Error('Saldo insuficiente');
      }

      const hash = await writeContractAsync({
        abi: [{
          name: 'transfer',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: [],
        }],
        address: recipient as `0x${string}`,
        functionName: 'transfer',
        value: parseEther(amount),
      });

      setSuccess(`Transação enviada com sucesso! Hash: ${hash}`);
      
      setTransactions(prev => [{
        hash,
        recipient,
        amount,
        timestamp: Date.now(),
        confirmed: true,
      }, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar transação');
    } finally {
      setLoading(false);
    }
  };

  const getChainName = (id: number) => {
    switch (id) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return 'Desconhecida';
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Carteira não conectada</CardTitle>
            <CardDescription>
              Por favor, conecte sua carteira para continuar.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sua Carteira</CardTitle>
            <CardDescription>Informações da carteira</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Endereço</div>
                <div className="font-mono break-all">{address}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rede</div>
                <div>{getChainName(chainId)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Saldo</div>
                <div className="text-2xl font-bold">
                  {balance ? formatEther(balance.value) : '0'} ETH
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enviar ETH</CardTitle>
            <CardDescription>Transferir ETH para outro endereço</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Destinatário
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantidade (ETH)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                  placeholder="0.0"
                  step="0.000000000000000001"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm">{success}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Histórico de transações enviadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <div className="text-sm text-gray-500">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                  <div className="font-mono text-sm">
                    Para: {tx.recipient.slice(0, 6)}...{tx.recipient.slice(-4)}
                  </div>
                  <div className="text-sm">
                    {tx.amount} ETH
                  </div>
                </div>
                <div>
                  <a
                    href={`https://${chainId === 1 ? '' : getChainName(chainId).toLowerCase() + '.'}etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Ver transação
                  </a>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-gray-500">
                Nenhuma transação recente
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
