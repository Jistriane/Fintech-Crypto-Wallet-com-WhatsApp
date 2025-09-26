import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsappController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
const controller = WhatsAppController.getInstance();

// Webhook verification
router.get('/webhook', controller.verifyWebhook);

// Webhook handler
router.post('/webhook', controller.handleWebhook);

// Send message
router.post(
  '/messages',
  authenticate,
  validate({
    body: z.object({
      type: z.enum(['text', 'template', 'interactive']),
      to: z.string(),
      text: z.string().optional(),
      template: z
        .object({
          name: z.string(),
          language: z.object({
            code: z.string(),
          }),
          components: z
            .array(
              z.object({
                type: z.enum(['body', 'header', 'button']),
                parameters: z.array(
                  z.object({
                    type: z.enum([
                      'text',
                      'currency',
                      'date_time',
                      'image',
                      'document',
                    ]),
                    text: z.string().optional(),
                    currency: z
                      .object({
                        fallback_value: z.string(),
                        code: z.string(),
                        amount_1000: z.number(),
                      })
                      .optional(),
                    date_time: z
                      .object({
                        fallback_value: z.string(),
                      })
                      .optional(),
                    image: z
                      .object({
                        link: z.string(),
                      })
                      .optional(),
                    document: z
                      .object({
                        link: z.string(),
                      })
                      .optional(),
                  })
                ),
              })
            )
            .optional(),
        })
        .optional(),
      interactive: z
        .object({
          type: z.enum(['button', 'list']),
          header: z
            .object({
              type: z.literal('text'),
              text: z.string(),
            })
            .optional(),
          body: z.object({
            text: z.string(),
          }),
          footer: z
            .object({
              text: z.string(),
            })
            .optional(),
          action: z.object({
            buttons: z
              .array(
                z.object({
                  type: z.literal('reply'),
                  reply: z.object({
                    id: z.string(),
                    title: z.string(),
                  }),
                })
              )
              .optional(),
            sections: z
              .array(
                z.object({
                  title: z.string(),
                  rows: z.array(
                    z.object({
                      id: z.string(),
                      title: z.string(),
                      description: z.string().optional(),
                    })
                  ),
                })
              )
              .optional(),
          }),
        })
        .optional(),
    }),
  }),
  controller.sendMessage
);

// Send template
router.post(
  '/templates',
  authenticate,
  validate({
    body: z.object({
      to: z.string(),
      templateName: z.string(),
      params: z.record(z.any()),
    }),
  }),
  controller.sendTemplate
);

// Send interactive message
router.post(
  '/interactive/buttons',
  authenticate,
  validate({
    body: z.object({
      to: z.string(),
      header: z.string(),
      body: z.string(),
      buttons: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
        })
      ),
    }),
  }),
  controller.sendInteractiveMessage
);

// Send list message
router.post(
  '/interactive/list',
  authenticate,
  validate({
    body: z.object({
      to: z.string(),
      header: z.string(),
      body: z.string(),
      sections: z.array(
        z.object({
          title: z.string(),
          items: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().optional(),
            })
          ),
        })
      ),
    }),
  }),
  controller.sendListMessage
);

export default router;
