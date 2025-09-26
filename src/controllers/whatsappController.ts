import { Request, Response } from 'express';
import WhatsAppService from '../services/whatsappService';
import { WhatsAppWebhookEvent } from '../types/whatsapp';

export class WhatsAppController {
  private static instance: WhatsAppController;
  private whatsapp: WhatsAppService;

  private constructor() {
    this.whatsapp = WhatsAppService.getInstance();
  }

  public static getInstance(): WhatsAppController {
    if (!WhatsAppController.instance) {
      WhatsAppController.instance = new WhatsAppController();
    }
    return WhatsAppController.instance;
  }

  public verifyWebhook = (req: Request, res: Response): void => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && this.whatsapp.verifyWebhook(token as string)) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  };

  public handleWebhook = (req: Request, res: Response): void => {
    const event = req.body as WhatsAppWebhookEvent;

    if (event.object === 'whatsapp_business_account') {
      this.whatsapp.handleWebhook(event);
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  };

  public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await this.whatsapp.sendMessage(req.body);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to send message',
      });
    }
  };

  public sendTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, templateName, params } = req.body;
      const response = await this.whatsapp.sendTemplate(to, templateName, params);
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to send template',
      });
    }
  };

  public sendInteractiveMessage = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { to, header, body, buttons } = req.body;
      const response = await this.whatsapp.sendInteractiveMessage(
        to,
        header,
        body,
        buttons
      );
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to send interactive message',
      });
    }
  };

  public sendListMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const { to, header, body, sections } = req.body;
      const response = await this.whatsapp.sendListMessage(
        to,
        header,
        body,
        sections
      );
      res.status(200).json(response);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || 'Failed to send list message',
      });
    }
  };
}
