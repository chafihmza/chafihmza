import { Router } from 'express';
import { login, refresh, logout } from '../controllers/authController.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';
import { requireCsrf } from '../middleware/csrf.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', requireCsrf, refresh);
router.post('/logout', requireCsrf, logout);
export default router;
