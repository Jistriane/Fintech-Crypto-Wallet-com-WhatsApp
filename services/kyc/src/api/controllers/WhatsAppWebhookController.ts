import { Request, Response } from 'express';
import { NotusWhatsAppService } from '../../infrastructure/whatsapp/NotusWhatsAppService';
import { KYCService } from '../../domain/KYCService';
import { whatsappRateLimitMiddleware } from '@common/infrastructure/middleware/rateLimitMiddleware';

export class WhatsAppWebhookController {
  constructor(
    private readonly whatsappService: NotusWhatsAppService,
    private readonly kycService: KYCService
  ) {}

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.header('X-Notus-Signature');
      if (!this.verifySignature(signature, req.body)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      await this.whatsappService.handleWebhook(req.body);
      await this.processWebhookEvent(req.body);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private verifySignature(signature: string | undefined, body: any): boolean {
    if (!signature) return false;

    // TODO: Implementar verificação real da assinatura
    return true;
  }

  private async processWebhookEvent(event: any): Promise<void> {
    const { type, phone, userId, data } = event;

    switch (type) {
      case 'message':
        await this.handleIncomingMessage(phone, userId, data);
        break;

      case 'status_update':
        await this.handleStatusUpdate(phone, userId, data);
        break;

      case 'document_upload':
        await this.handleDocumentUpload(phone, userId, data);
        break;

      default:
        console.warn(`Unknown webhook event type: ${type}`);
    }
  }

  private async handleIncomingMessage(
    phone: string,
    userId: string,
    data: any
  ): Promise<void> {
    // TODO: Implementar lógica de processamento de mensagens
    console.log(`[WhatsApp] Mensagem recebida de ${phone}:`, data);
  }

  private async handleStatusUpdate(
    phone: string,
    userId: string,
    data: any
  ): Promise<void> {
    // TODO: Implementar lógica de processamento de atualizações de status
    console.log(`[WhatsApp] Atualização de status para ${phone}:`, data);
  }

  private async handleDocumentUpload(
    phone: string,
    userId: string,
    data: any
  ): Promise<void> {
    try {
      const document = {
        type: data.documentType,
        image: Buffer.from(data.image, 'base64'),
        metadata: data.metadata
      };

      const isValid = await this.kycService.processDocument(userId, document);

      if (isValid) {
        await this.whatsappService.notifyDocumentApproved(
          phone,
          userId,
          document.type
        );
      } else {
        await this.whatsappService.notifyDocumentRejected(
          phone,
          userId,
          document.type,
          'Documento não atende aos critérios de qualidade'
        );
      }
    } catch (error) {
      console.error('Error processing document upload:', error);
      await this.whatsappService.notifyDocumentRejected(
        phone,
        userId,
        data.documentType,
        'Erro ao processar documento'
      );
    }
  }

  setupRoutes(app: any): void {
    const router = app.Router();

    // Aplicar rate limiting
    router.use(whatsappRateLimitMiddleware);

    // Rota de webhook
    router.post('/webhook/notus', this.handleWebhook.bind(this));

    app.use('/api/v1/whatsapp', router);
  }
}
