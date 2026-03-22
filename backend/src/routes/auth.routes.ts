import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../validation/auth.validation.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);

export default router;
