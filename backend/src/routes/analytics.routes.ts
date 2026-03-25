import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/index.js';

const router = Router();

router.get('/', authenticateToken, AnalyticsController.getAnalytics);
router.post('/link-click', AnalyticsController.linkClick);
router.post('/profile-view', AnalyticsController.profileView);

export default router;
