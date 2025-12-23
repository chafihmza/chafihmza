import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from './auth.js';

export function requireConnectorAccess(canWrite = false) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const connectorId = (req.body.connectorId || req.query.connectorId || req.params.id) as string;
    if (!connectorId) {
      return res.status(400).json({ message: 'Connector ID required' });
    }
    if (req.user?.role === 'ADMIN') {
      return next();
    }
    const permission = await prisma.connectorPermission.findUnique({
      where: { connectorId_userId: { connectorId, userId: req.user?.id ?? '' } }
    });
    if (!permission || (!permission.canRead && !permission.canWrite)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (canWrite && !permission.canWrite) {
      return res.status(403).json({ message: 'Write access required' });
    }
    return next();
  };
}
