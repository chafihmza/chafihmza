import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { logAudit } from '../services/auditService.js';

export async function createUser(req: Request, res: Response) {
  const { name, email, password, role } = req.body as {
    name: string; email: string; password: string; role: string;
  };
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, role }
  });
  await logAudit({
    userId: (req as any).user?.id,
    action: 'create_user',
    ip: req.ip,
    status: 'success',
    meta: { createdUserId: user.id }
  });
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function listUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
  });
  return res.json(users);
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email, role, isActive } = req.body as {
    name?: string; email?: string; role?: string; isActive?: boolean;
  };
  const user = await prisma.user.update({
    where: { id },
    data: { name, email, role, isActive }
  });
  await logAudit({
    userId: (req as any).user?.id,
    action: 'update_user',
    ip: req.ip,
    status: 'success',
    meta: { updatedUserId: user.id }
  });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  await logAudit({
    userId: (req as any).user?.id,
    action: 'delete_user',
    ip: req.ip,
    status: 'success',
    meta: { deletedUserId: id }
  });
  return res.status(204).send();
}
