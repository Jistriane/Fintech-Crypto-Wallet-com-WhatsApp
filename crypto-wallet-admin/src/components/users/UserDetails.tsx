import { useState } from 'react';
import { User, UserActivity } from '@/types/users';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface UserDetailsProps {
  user: User;
  activity: UserActivity[];
}

export function UserDetails({ user, activity }: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info');

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

      {activeTab === 'info' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card title="Informações Básicas">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Função</dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      user.role === 'admin'
                        ? 'error'
                        : user.role === 'manager'
                        ? 'warning'
                        : 'info'
                    }
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Badge variant={user.isActive ? 'success' : 'error'}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="KYC">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nível</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Nível {user.kycLevel}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      user.kycStatus === 'APPROVED'
                        ? 'success'
                        : user.kycStatus === 'PENDING'
                        ? 'warning'
                        : user.kycStatus === 'REJECTED'
                        ? 'error'
                        : 'secondary'
                    }
                  >
                    {user.kycStatus === 'APPROVED'
                      ? 'Aprovado'
                      : user.kycStatus === 'PENDING'
                      ? 'Pendente'
                      : user.kycStatus === 'REJECTED'
                      ? 'Rejeitado'
                      : 'Não Enviado'}
                  </Badge>
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      ) : (
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
                            item.type === 'LOGIN'
                              ? 'bg-green-500'
                              : item.type === 'LOGOUT'
                              ? 'bg-gray-500'
                              : item.type === 'KYC_UPDATE'
                              ? 'bg-blue-500'
                              : item.type === 'ROLE_UPDATE'
                              ? 'bg-purple-500'
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
                          {new Date(item.createdAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
