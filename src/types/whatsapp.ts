export interface WhatsAppMessage {
  type: 'text' | 'template' | 'interactive';
  to: string;
  text?: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: {
      type: 'body' | 'header' | 'button';
      parameters: {
        type: 'text' | 'currency' | 'date_time' | 'image' | 'document';
        text?: string;
        currency?: {
          fallback_value: string;
          code: string;
          amount_1000: number;
        };
        date_time?: {
          fallback_value: string;
        };
        image?: {
          link: string;
        };
        document?: {
          link: string;
        };
      }[];
    }[];
  };
  interactive?: {
    type: 'button' | 'list';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons?: {
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }[];
      sections?: {
        title: string;
        rows: {
          id: string;
          title: string;
          description?: string;
        }[];
      }[];
    };
  };
}

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: {
    input: string;
    wa_id: string;
  }[];
  messages: {
    id: string;
  }[];
}

export interface WhatsAppWebhookEvent {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        messages?: {
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          interactive?: {
            type: string;
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
              description?: string;
            };
          };
        }[];
        statuses?: {
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }[];
      };
      field: string;
    }[];
  }[];
}

export interface WhatsAppConfig {
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  templates: {
    [key: string]: {
      name: string;
      language: string;
      components: {
        type: string;
        text?: string;
        parameters?: {
          type: string;
          [key: string]: any;
        }[];
      }[];
    };
  };
}

export interface WhatsAppState {
  isConnected: boolean;
  lastError: string | null;
  messageQueue: WhatsAppMessage[];
  retryCount: number;
  isRetrying: boolean;
  lastRetryTimestamp: number | null;
}
