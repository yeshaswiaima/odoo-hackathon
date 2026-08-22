import { Router } from 'express';
import { getDashboardMetrics, getReportsData } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleAuth.js';

const router = Router();

router.use(authenticateToken);

router.get('/metrics', getDashboardMetrics);
router.get('/analytics', requireAdmin, getReportsData);

export default router;
