import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';

const router = Router();

router.post('/link-click', AnalyticsController.linkClick);
router.post('/profile-view', AnalyticsController.profileView);

export default router;
