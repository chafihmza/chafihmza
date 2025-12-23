import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export async function health(req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({ status: 'ok' });
  } catch {
    return res.status(500).json({ status: 'error' });
  }
}

export async function systemInfo(req: Request, res: Response) {
  return res.json({
    version: env.appVersion,
    status: 'ok'
  });
}
