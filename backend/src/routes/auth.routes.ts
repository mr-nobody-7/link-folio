import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);

export default router;
