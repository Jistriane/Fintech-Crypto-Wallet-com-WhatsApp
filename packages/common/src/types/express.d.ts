import { Session } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: Session;
      nonce?: string;
    }
  }
}
