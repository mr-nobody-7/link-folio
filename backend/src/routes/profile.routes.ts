import { Router } from 'express';
import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js';
import { authenticateToken } from '../middleware/index.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validation/profile.validation.js';

const router = Router();

router.get('/:username', getProfile);
router.put('/', authenticateToken, validate(updateProfileSchema), updateProfile);

export default router;
