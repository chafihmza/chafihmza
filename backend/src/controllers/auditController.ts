import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function listAudit(req: Request, res: Response) {
  const { from, to, userId, connectorId, action } = req.query;
  const filters: any = {};
  if (from || to) {
    filters.createdAt = {};
    if (from) filters.createdAt.gte = new Date(String(from));
    if (to) filters.createdAt.lte = new Date(String(to));
  }
  if (userId) filters.userId = String(userId);
  if (connectorId) filters.connectorId = String(connectorId);
  if (action) filters.action = String(action);

  const logs = await prisma.auditLog.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' }
  });
  return res.json(logs);
}
