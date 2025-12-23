import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/hash.js';
import { setCsrfToken } from '../middleware/csrf.js';
import { logAudit } from '../services/auditService.js';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  const ip = req.ip;
  if (!user || !user.isActive) {
    await logAudit({ action: 'login', ip, status: 'failed' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await logAudit({ userId: user.id, action: 'login', ip, status: 'failed' });
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  const csrfToken = setCsrfToken(res);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  });
  await logAudit({ userId: user.id, action: 'login', ip, status: 'success' });
  return res.json({ accessToken, csrfToken });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }
  try {
    const payload = verifyRefreshToken(token);
    const stored = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
    if (!stored) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role });
    const csrfToken = setCsrfToken(res);
    return res.json({ accessToken, csrfToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (token) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token) },
      data: { revokedAt: new Date() }
    });
  }
  res.clearCookie('refresh_token');
  res.clearCookie('csrf_token');
  return res.json({ message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true }
  });
  return res.json(user);
}
