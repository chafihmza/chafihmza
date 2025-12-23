import { Router } from 'express';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'USER'])
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'USER']).optional(),
  isActive: z.boolean().optional()
});

router.use(requireAuth, requireRole('ADMIN'));
router.post('/', validateBody(createSchema), createUser);
router.get('/', listUsers);
router.patch('/:id', validateBody(updateSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
