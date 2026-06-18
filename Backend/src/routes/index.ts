import { Router, Request, Response } from 'express';
import authRoutes        from './authRoutes';
import transactionRoutes from './transactionRoutes';
import goalRoutes        from './goalRoutes';
import dashboardRoutes   from './dashboardRoutes';
import chatRoutes        from './chatRoutes';
import categoryRoutes    from './categoryRoutes';
import { pool }          from '../config/database';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

router.use('/auth',         authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/goals',        goalRoutes);
router.use('/dashboard',    dashboardRoutes);
router.use('/chat',         chatRoutes);
router.use('/categories',   categoryRoutes);

export default router;
