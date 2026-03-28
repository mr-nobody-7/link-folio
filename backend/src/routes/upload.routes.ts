import { Router } from 'express';
import { authenticateToken } from '../middleware/index.js';
import { uploadSingle } from '../middleware/upload.js';
import { uploadAvatar } from '../controllers/upload.controller.js';

const router = Router();

router.post('/avatar', authenticateToken, uploadSingle, uploadAvatar);

export default router;