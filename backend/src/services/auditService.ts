import { prisma } from '../config/prisma.js';

export async function logAudit(params: {
  userId?: string;
  connectorId?: string;
  action: string;
  path?: string;
  meta?: Record<string, unknown>;
  ip: string;
  status: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      connectorId: params.connectorId,
      action: params.action,
      path: params.path,
      metaJson: params.meta,
      ip: params.ip,
      status: params.status
    }
  });
}
