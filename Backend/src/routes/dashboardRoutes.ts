import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import * as dashboard from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);

router.get('/summary', dashboard.getSummary);
router.post('/categories', dashboard.createCategory);
router.get('/categories', dashboard.getCategories);

export default router; 