import { Router } from 'express';
import {
  getProfile,
  updateProfile,
} from '../controllers/profile.controller.js';
import { authenticateToken } from '../middleware/index.js';

const router = Router();

router.get('/:username', getProfile);
router.put('/', authenticateToken, updateProfile);

export default router;
