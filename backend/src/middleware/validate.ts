import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation error', errors: result.error.flatten() });
  }
  req.body = result.data;
  return next();
};

export const validateQuery = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ message: 'Validation error', errors: result.error.flatten() });
  }
  req.query = result.data;
  return next();
};
