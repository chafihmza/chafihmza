import { Router } from 'express';
import { deleteFile, downloadFile, listFiles, makeDir, moveFile, renameFile, searchFiles, uploadFile } from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireConnectorAccess } from '../middleware/permissions.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const listSchema = z.object({
  connectorId: z.string().uuid(),
  path: z.string().optional()
});

const mkdirSchema = z.object({
  connectorId: z.string().uuid(),
  path: z.string()
});

const renameSchema = z.object({
  connectorId: z.string().uuid(),
  from: z.string(),
  to: z.string()
});

const deleteSchema = z.object({
  connectorId: z.string().uuid(),
  path: z.string()
});

const moveSchema = z.object({
  connectorId: z.string().uuid(),
  from: z.string(),
  to: z.string()
});

const searchSchema = z.object({
  connectorId: z.string().uuid(),
  q: z.string().min(1)
});

router.use(requireAuth);
router.get('/list', validateQuery(listSchema), requireConnectorAccess(false), listFiles);
router.post('/mkdir', validateBody(mkdirSchema), requireConnectorAccess(true), makeDir);
router.post('/upload', requireConnectorAccess(true), uploadFile);
router.get('/download', requireConnectorAccess(false), downloadFile);
router.post('/rename', validateBody(renameSchema), requireConnectorAccess(true), renameFile);
router.post('/delete', validateBody(deleteSchema), requireConnectorAccess(true), deleteFile);
router.post('/move', validateBody(moveSchema), requireConnectorAccess(true), moveFile);
router.get('/search', validateQuery(searchSchema), requireConnectorAccess(false), searchFiles);

export default router;
