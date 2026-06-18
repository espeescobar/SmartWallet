import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { pool } from '../config/database';

const router = Router();

router.use(authenticate);

// GET /api/v1/categories?type=expense|income
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const params: string[] = [];
    let where = "WHERE (user_id IS NULL OR user_id = $1)";
    params.push((req as any).userId);

    if (type === 'expense' || type === 'income') {
      where += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    const { rows } = await pool.query(
      `SELECT id, name, icon, color, type FROM categories ${where} ORDER BY type, name`,
      params,
    );
    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
