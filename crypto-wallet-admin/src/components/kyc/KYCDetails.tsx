import { useState } from 'react';
import { KYCDetails as KYCDetailsType, UpdateKYCRequestData, UpdateKYCDocumentData } from '@/types/kyc';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

interface KYCDetailsProps {
  details: KYCDetailsType;
  onUpdateRequest: (requestId: string, data: UpdateKYCRequestData) => Promise<void>;
  onUpdateDocument: (
    requestId: string,
    documentId: string,
    data: UpdateKYCDocumentData
  ) => Promise<void>;
}

export function KYCDetails({
  details,
  onUpdateRequest,
  onUpdateDocument,
}: KYCDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'events'>(
    'info'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { request, events, user } = details;

  const handleUpdateRequest = async (status: KYCDetailsType['request']['status']) => {
    setIsSubmitting(true);
    try {
      await onUpdateRequest(request.id, { status, notes });
      setNotes('');
    } catch (error) {
      console.error('Error updating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDocument = async (
    documentId: string,
    status: KYCDetailsType['request']['documents'][0]['status']
  ) => {
    setIsSubmitting(true);
    try {
      await onUpdateDocument(request.id, documentId, { status, notes });
      setNotes('');
    } catch (error) {
      console.error('Error updating document:', error);
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
            onClick={() => setActiveTab('documents')}
            className={`${
              activeTab === 'documents'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Documentos
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`${
              activeTab === 'events'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card title="Informações do Usuário">
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
                <dt className="text-sm font-medium text-gray-500">
                  Nível Atual
                </dt>
                <dd className="mt-1">
                  <Badge variant="primary">Nível {user.currentLevel}</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Detalhes da Solicitação">
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Nível Solicitado
                </dt>
                <dd className="mt-1">
                  <Badge variant="primary">Nível {request.level}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Badge
                    variant={
                      request.status === 'APPROVED'
                        ? 'success'
                        : request.status === 'PENDING'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {request.status === 'APPROVED'
                      ? 'Aprovado'
                      : request.status === 'PENDING'
                      ? 'Pendente'
                      : 'Rejeitado'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Data da Solicitação
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(request.createdAt).toLocaleString('pt-BR')}
                </dd>
              </div>
              {request.reviewedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Data da Revisão
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(request.reviewedAt).toLocaleString('pt-BR')}
                  </dd>
                </div>
              )}
              {request.notes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Observações
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.notes}
                  </dd>
                </div>
              )}
            </dl>

            {request.status === 'PENDING' && (
              <div className="mt-6 space-y-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateRequest('REJECTED')}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Rejeitar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateRequest('APPROVED')}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    Aprovar
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {request.documents.map((document) => (
            <Card
              key={document.id}
              title={document.type.replace('_', ' ')}
            >
              <div className="space-y-4">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={document.url}
                    alt={document.type}
                    className="object-contain w-full h-full"
                  />
                </div>

                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd className="mt-1">
                      <Badge
                        variant={
                          document.status === 'APPROVED'
                            ? 'success'
                            : document.status === 'PENDING'
                            ? 'warning'
                            : 'error'
                        }
                      >
                        {document.status === 'APPROVED'
                          ? 'Aprovado'
                          : document.status === 'PENDING'
                          ? 'Pendente'
                          : 'Rejeitado'}
                      </Badge>
                    </dd>
                  </div>
                  {document.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Observações
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {document.notes}
                      </dd>
                    </div>
                  )}
                </dl>

                {request.status === 'PENDING' && document.status === 'PENDING' && (
                  <div className="space-y-4">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Adicione observações..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateDocument(document.id, 'REJECTED')}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateDocument(document.id, 'APPROVED')}
                        disabled={isSubmitting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
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
                              : event.type === 'DOCUMENT_UPLOADED'
                              ? 'bg-yellow-500'
                              : event.type === 'DOCUMENT_REVIEWED'
                              ? 'bg-green-500'
                              : 'bg-purple-500'
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
                          {event.createdBy && (
                            <p className="text-xs text-gray-400">
                              por {event.createdBy}
                            </p>
                          )}
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
    </div>
  );
}
