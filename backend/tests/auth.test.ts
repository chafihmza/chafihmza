import { describe, it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { signAccessToken } from '../src/utils/jwt.js';
import { requireAuth } from '../src/middleware/auth.js';

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

import { prisma } from '../src/config/prisma.js';

describe('auth middleware', () => {
  it('rejects missing token', async () => {
    const app = express();
    app.get('/secure', requireAuth, (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/secure');
    expect(res.status).toBe(401);
  });

  it('allows valid token', async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-1',
      role: 'ADMIN',
      isActive: true
    });
    const app = express();
    app.get('/secure', requireAuth, (_req, res) => res.json({ ok: true }));
    const token = signAccessToken({ sub: 'user-1', role: 'ADMIN' });
    const res = await request(app).get('/secure').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
