"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { notusService } from '@/services/notus'

interface Template {
  id: string
  name: string
  language: string
  components: Array<{
    type: string
    parameters?: Array<{
      type: string
      text: string
    }>
  }>
}

interface TemplateMessageProps {
  phone: string
}

export function TemplateMessage({ phone }: TemplateMessageProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    try {
      setLoading(true)
      const template = availableTemplates.find(t => t.id === selectedTemplate)

      if (!template) {
        toast({
          title: 'Erro',
          description: 'Por favor selecione um template',
          variant: 'destructive',
        })
        return
      }

      await notusService.sendTemplate({
        to: phone,
        templateId: template.id,
        language: template.language,
        parameters: template.components
          .filter(comp => comp.parameters)
          .map(comp => ({
            type: 'text',
            value: comp.parameters?.[0]?.text || ''
          }))
      })

      toast({
        title: 'Sucesso',
        description: 'Mensagem enviada com sucesso',
      })

      setSelectedTemplate('')
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await notusService.getTemplates()
        setAvailableTemplates(templates)
      } catch {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os templates',
          variant: 'destructive',
        })
      }
    }

    loadTemplates()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Mensagem</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Template</Label>
          <Select
            value={selectedTemplate}
            onValueChange={setSelectedTemplate}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um template" />
            </SelectTrigger>
            <SelectContent>
              {availableTemplates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div className="rounded-lg bg-muted p-4">
              {availableTemplates
                .find(t => t.id === selectedTemplate)
                ?.components.map((component, index) => (
                  <div key={index} className="mb-2">
                    {component.type === 'header' && (
                      <h3 className="font-bold">
                        {component.parameters?.[0]?.text}
                      </h3>
                    )}
                    {component.type === 'body' && (
                      <p>{component.parameters?.[0]?.text}</p>
                    )}
                    {component.type === 'footer' && (
                      <p className="text-sm text-muted-foreground">
                        {component.parameters?.[0]?.text}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSendMessage}
          disabled={!selectedTemplate || loading}
          className="w-full"
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </CardContent>
    </Card>
  )
}