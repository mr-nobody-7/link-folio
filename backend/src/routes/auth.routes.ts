import { Router } from 'express';
import {
	signup,
	login,
	refreshToken,
	logout,
	forgotPassword,
	resetPassword,
} from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
	signupSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} from '../validation/auth.validation.js';
import { authenticateToken } from '../middleware/index.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticateToken, logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
