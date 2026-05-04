import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middlewares/authenticate';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.query.month as string | undefined;
    const data  = await dashboardService.getSummary((req as AuthRequest).userId, month);
    res.json(data);
  } catch (err) { next(err); }
}
