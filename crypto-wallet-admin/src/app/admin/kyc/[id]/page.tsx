'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { kycService } from '@/services/kyc';
import type { KYCRequest } from '@/types/kyc';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  Plus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface KYCDetailsProps {
  params: {
    id: string;
  };
}

export default function KYCDetailsPage({ params }: KYCDetailsProps) {
  const [request, setRequest] = useState<KYCRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [showDocumentRequest, setShowDocumentRequest] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
    try {
      setIsLoading(true);
      const data = await kycService.getRequest(params.id);
      setRequest(data);
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
      toast.error('Erro ao carregar solicitação');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove() {
    if (!request) return;
    try {
      await kycService.approveRequest(request.id, request.level);
      toast.success('Solicitação aprovada com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error);
      toast.error('Erro ao aprovar solicitação');
    }
  }

  async function handleReject() {
    if (!request || !rejectionReason) return;
    try {
      await kycService.rejectRequest(request.id, rejectionReason);
      toast.success('Solicitação rejeitada com sucesso');
      setShowRejectionForm(false);
      setRejectionReason('');
      loadData();
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      toast.error('Erro ao rejeitar solicitação');
    }
  }

  async function handleRequestDocuments() {
    if (!request || selectedDocuments.length === 0) return;
    try {
      await kycService.requestAdditionalDocuments(
        request.id,
        selectedDocuments as any[]
      );
      toast.success('Documentos solicitados com sucesso');
      setShowDocumentRequest(false);
      setSelectedDocuments([]);
      loadData();
    } catch (error) {
      console.error('Erro ao solicitar documentos:', error);
      toast.error('Erro ao solicitar documentos');
    }
  }

  async function handleDownloadDocument(documentId: string) {
    if (!request) return;
    try {
      const blob = await kycService.downloadDocument(request.id, documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast.error('Erro ao baixar documento');
    }
  }

  if (isLoading || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Solicitação</h1>
          <p className="text-muted-foreground">
            Revise os documentos e informações do usuário
          </p>
        </div>
        <Link href="/admin/kyc">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Informações do Usuário</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{request.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{request.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-medium">{request.user.cpf}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p className="font-medium">
                {new Date(request.user.birthDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{request.user.phone}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium">Status da Solicitação</h3>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="mt-1 flex items-center space-x-2">
                {request.status === 'approved' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : request.status === 'rejected' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : request.status === 'in_review' ? (
                  <Clock className="h-5 w-5 text-blue-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span
                  className={`font-medium ${
                    request.status === 'approved'
                      ? 'text-green-700'
                      : request.status === 'rejected'
                      ? 'text-red-700'
                      : request.status === 'in_review'
                      ? 'text-blue-700'
                      : 'text-yellow-700'
                  }`}
                >
                  {request.status === 'approved'
                    ? 'Aprovado'
                    : request.status === 'rejected'
                    ? 'Rejeitado'
                    : request.status === 'in_review'
                    ? 'Em Análise'
                    : 'Pendente'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nível</p>
              <p className="font-medium">Nível {request.level}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data da Solicitação</p>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>
            {request.reviewedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Data da Revisão</p>
                <p className="font-medium">{formatDate(request.reviewedAt)}</p>
              </div>
            )}
            {request.rejectionReason && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Motivo da Rejeição
                </p>
                <p className="font-medium">{request.rejectionReason}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Documentos</h3>
          {request.status === 'pending' && (
            <Button
              variant="outline"
              onClick={() => setShowDocumentRequest(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Solicitar Documentos
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {request.documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border bg-card/50 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {doc.type === 'rg'
                      ? 'RG'
                      : doc.type === 'cnh'
                      ? 'CNH'
                      : doc.type === 'passport'
                      ? 'Passaporte'
                      : doc.type === 'proof_of_address'
                      ? 'Comprovante de Residência'
                      : 'Selfie'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enviado em {formatDate(doc.createdAt)}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    doc.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : doc.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : doc.status === 'in_review'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {doc.status === 'approved'
                    ? 'Aprovado'
                    : doc.status === 'rejected'
                    ? 'Rejeitado'
                    : doc.status === 'in_review'
                    ? 'Em Análise'
                    : 'Pendente'}
                </div>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={doc.url}
                  alt={doc.type}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white"
                    onClick={() => handleDownloadDocument(doc.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {doc.status === 'rejected' && doc.rejectionReason && (
                <p className="mt-2 text-sm text-red-500">
                  Motivo: {doc.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {request.status === 'pending' && (
        <div className="flex space-x-4">
          <Button
            className="flex-1"
            onClick={handleApprove}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowRejectionForm(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
        </div>
      )}

      {showRejectionForm && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Rejeitar Solicitação</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Motivo da Rejeição
              </label>
              <textarea
                id="reason"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason}
              >
                Confirmar Rejeição
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionForm(false);
                  setRejectionReason('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {showDocumentRequest && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">
            Solicitar Documentos Adicionais
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              {['rg', 'cnh', 'passport', 'proof_of_address', 'selfie'].map(
                (doc) => (
                  <label
                    key={doc}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments([...selectedDocuments, doc]);
                        } else {
                          setSelectedDocuments(
                            selectedDocuments.filter((d) => d !== doc)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>
                      {doc === 'rg'
                        ? 'RG'
                        : doc === 'cnh'
                        ? 'CNH'
                        : doc === 'passport'
                        ? 'Passaporte'
                        : doc === 'proof_of_address'
                        ? 'Comprovante de Residência'
                        : 'Selfie'}
                    </span>
                  </label>
                )
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleRequestDocuments}
                disabled={selectedDocuments.length === 0}
              >
                Solicitar Documentos
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDocumentRequest(false);
                  setSelectedDocuments([]);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
