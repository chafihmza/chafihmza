import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/prisma.js';

export type AuthRequest = Request & { user?: { id: string; role: string } };

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { id: user.id, role: user.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}
