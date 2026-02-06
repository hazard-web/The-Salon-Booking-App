import { Request, Response, NextFunction } from 'express';

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

export const isAuthenticated = (req: Request): req is Request & { user: { id: string; [key: string]: any } } => {
  return req.user !== undefined;
};

// Middleware to ensure `req.user` is defined before proceeding.