import { User } from '@ai-english-speaker/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};

