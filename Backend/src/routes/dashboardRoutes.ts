import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import * as dashboard from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);

// GET /api/v1/dashboard/summary?month=2025-05
router.get('/summary', dashboard.getSummary);

export default router;
