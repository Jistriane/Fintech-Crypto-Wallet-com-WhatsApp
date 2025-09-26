import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateWalletData, UpdateWalletData, Wallet } from '@/types/wallets';

const createWalletSchema = z.object({
  userId: z.string().min(1, 'Usuário é obrigatório'),
  network: z.string().min(1, 'Rede é obrigatória'),
});

const updateWalletSchema = z.object({
  isActive: z.boolean(),
});

type CreateWalletFormData = z.infer<typeof createWalletSchema>;
type UpdateWalletFormData = z.infer<typeof updateWalletSchema>;

interface WalletFormProps {
  wallet?: Wallet;
  onSubmit: (data: CreateWalletData | UpdateWalletData) => Promise<void>;
  onCancel: () => void;
}

export function WalletForm({ wallet, onSubmit, onCancel }: WalletFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWalletFormData | UpdateWalletFormData>({
    resolver: zodResolver(wallet ? updateWalletSchema : createWalletSchema),
    defaultValues: wallet
      ? {
          isActive: wallet.isActive,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!wallet ? (
        <>
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-gray-700"
            >
              ID do Usuário
            </label>
            <input
              type="text"
              id="userId"
              {...register('userId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="network"
              className="block text-sm font-medium text-gray-700"
            >
              Rede
            </label>
            <select
              id="network"
              {...register('network')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Selecione uma rede</option>
              <option value="ETHEREUM">Ethereum</option>
              <option value="POLYGON">Polygon</option>
              <option value="BSC">BSC</option>
              <option value="ARBITRUM">Arbitrum</option>
            </select>
            {errors.network && (
              <p className="mt-1 text-sm text-red-600">{errors.network.message}</p>
            )}
          </div>
        </>
      ) : (
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('isActive')}
              className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Carteira ativa</span>
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : wallet ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}
