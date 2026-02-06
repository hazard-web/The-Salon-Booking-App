import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string; // Added optional role property to align with middleware/auth.ts
        [key: string]: any;
      };
    }
  }
}

// This file extends the Express Request interface globally to include the `user` property.