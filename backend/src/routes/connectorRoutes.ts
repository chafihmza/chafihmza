import { Router } from 'express';
import { createConnector, deleteConnector, getConnector, listConnectors, testConnector, updateConnector } from '../controllers/connectorController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  protocol: z.enum(['SFTP', 'FTP', 'FTPS']),
  host: z.string().min(2),
  port: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  basePath: z.string().min(1)
}).refine((data) => data.password || data.privateKey, { message: 'Password or private key required' });

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  host: z.string().min(2).optional(),
  port: z.number().int().positive().optional(),
  username: z.string().min(1).optional(),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  basePath: z.string().min(1).optional()
});

router.use(requireAuth);
router.post('/', requireRole('ADMIN'), validateBody(createSchema), createConnector);
router.get('/', listConnectors);
router.get('/:id', getConnector);
router.patch('/:id', requireRole('ADMIN'), validateBody(updateSchema), updateConnector);
router.delete('/:id', requireRole('ADMIN'), deleteConnector);
router.post('/:id/test', requireRole('ADMIN'), testConnector);

export default router;
