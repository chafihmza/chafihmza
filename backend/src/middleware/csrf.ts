import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function setCsrfToken(res: Response) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,
    sameSite: 'strict',
    secure: false
  });
  return token;
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  return next();
}
