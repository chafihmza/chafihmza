import { Router } from 'express';
import { listAudit } from '../controllers/auditController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('ADMIN', 'MANAGER'));
router.get('/', listAudit);

export default router;
