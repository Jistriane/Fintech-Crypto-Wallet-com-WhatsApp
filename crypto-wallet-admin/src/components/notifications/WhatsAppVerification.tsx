"use client"

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { notusService } from '@/services/notus'
import { Icons } from '@/components/icons'

interface WhatsAppVerificationProps {
  onVerified: (phone: string) => void
}

export function WhatsAppVerification({ onVerified }: WhatsAppVerificationProps) {
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const formatPhoneNumber = useCallback((value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Tenta dar match no formato brasileiro
    const match = numbers.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/)
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`
    }
    
    // Se não der match, retorna os números como estão
    return numbers
  }, [])

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      setPhone(formatted)
    },
    [formatPhoneNumber]
  )

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Aceita apenas números
      const value = e.target.value.replace(/\D/g, '')
      setVerificationCode(value)
    },
    []
  )

  const handleSendCode = async () => {
    if (!phone) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um número de telefone',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      // Remove toda formatação do número
      const cleanPhone = phone.replace(/\D/g, '')
      
      await notusService.sendWhatsAppCode(cleanPhone)
      
      setCodeSent(true)
      toast({
        title: 'Código Enviado',
        description: 'Verifique o código recebido no seu WhatsApp',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o código de verificação',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira o código de verificação',
        variant: 'destructive',
      })
      return
    }

    setVerifying(true)
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const verified = await notusService.verifyWhatsAppCode(cleanPhone, verificationCode)
      
      if (verified) {
        toast({
          title: 'Sucesso',
          description: 'Número do WhatsApp verificado com sucesso',
        })
        onVerified?.(cleanPhone)
      } else {
        toast({
          title: 'Erro',
          description: 'Código inválido. Tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao verificar o código',
        variant: 'destructive',
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Número do WhatsApp</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+55 (11) 99999-9999"
          value={phone}
          onChange={handlePhoneChange}
          disabled={codeSent || loading}
        />
      </div>

      {!codeSent ? (
        <Button 
          onClick={handleSendCode} 
          disabled={loading || !phone}
          className="w-full"
        >
          {loading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {loading ? 'Enviando código...' : 'Enviar código de verificação'}
        </Button>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={verificationCode}
              onChange={handleCodeChange}
              disabled={verifying}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleVerifyCode} 
              disabled={verifying || !verificationCode}
              className="w-full"
            >
              {verifying && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {verifying ? 'Verificando...' : 'Verificar código'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCodeSent(false)
                setVerificationCode('')
              }}
              disabled={loading || verifying}
              className="w-full"
            >
              Usar outro número
            </Button>
          </div>
        </>
      )}
    </div>
  );
}