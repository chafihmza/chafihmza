import { Router } from 'express';
import { health, systemInfo } from '../controllers/systemController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/health', health);
router.get('/system', requireAuth, requireRole('ADMIN'), systemInfo);

export default router;
