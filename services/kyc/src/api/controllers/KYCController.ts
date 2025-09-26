import { Request, Response } from 'express';
import { KYCService, KYCDocument } from '../../domain/KYCService';
import { rateLimitMiddleware, whatsappRateLimitMiddleware } from '@common/infrastructure/middleware/rateLimitMiddleware';

export class KYCController {
  constructor(private readonly kycService: KYCService) {}

  async startKYC(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      await this.kycService.startKYCProcess(userId);

      res.status(200).json({
        message: 'KYC process started successfully'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to start KYC process',
        message: error.message
      });
    }
  }

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { type } = req.body;
      const image = req.file?.buffer;

      if (!image) {
        res.status(400).json({
          error: 'No document image provided'
        });
        return;
      }

      const document: KYCDocument = {
        type,
        image,
        metadata: req.body.metadata
      };

      const isValid = await this.kycService.processDocument(userId, document);

      if (isValid) {
        res.status(200).json({
          message: 'Document processed successfully'
        });
      } else {
        res.status(400).json({
          error: 'Document validation failed'
        });
      }
    } catch (error) {
      res.status(500).json({
        error: 'Failed to process document',
        message: error.message
      });
    }
  }

  async getKYCStatus(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const status = await this.kycService.getKYCStatus(userId);

      res.status(200).json(status);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get KYC status',
        message: error.message
      });
    }
  }

  // Configurar rotas
  setupRoutes(app: any): void {
    const router = app.Router();

    // Aplicar rate limiting
    router.use(rateLimitMiddleware);
    router.use('/whatsapp', whatsappRateLimitMiddleware);

    // Rotas
    router.post('/users/:userId/kyc/start', this.startKYC.bind(this));
    router.post('/users/:userId/kyc/documents', this.uploadDocument.bind(this));
    router.get('/users/:userId/kyc/status', this.getKYCStatus.bind(this));

    app.use('/api/v1/kyc', router);
  }
}
