import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middlewares/authenticate';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { month, from, to } = req.query as { month?: string; from?: string; to?: string };
    const data  = await dashboardService.getSummary((req as AuthRequest).userId, { month, from, to });
    res.json(data);
  } catch (err) { 
    next(err); 
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const { name, type, budget_amount, icon, color } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Faltan datos obligatorios (name, type)' });
      return;
    }

    const newCategory = await dashboardService.createCategory(userId, { name, type, budget_amount, icon, color });
    res.status(201).json({ message: 'Categoría creada con éxito', category: newCategory });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const type = req.query.type as string | undefined; 
    const categories = await dashboardService.getCategories(userId, type);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}