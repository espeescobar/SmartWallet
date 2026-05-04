import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { AuthRequest } from '../middlewares/authenticate';

export async function getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.query.month as string | undefined;
    const data  = await dashboardService.getSummary((req as AuthRequest).userId, month);
    res.json(data);
  } catch (err) { 
    next(err); 
  }
}



// NUEVO CONTROLADOR PARA CREAR LA CATEGORÍA
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const { name, type, budget_amount, icon, color } = req.body;

    if (!name || !type) {
      res.status(400).json({ error: 'Faltan datos obligatorios (name, type)' });
      return;
    }

    const newCategory = await dashboardService.createCategory(userId, {
      name,
      type,
      budget_amount,
      icon,
      color
    });

    res.status(201).json({
      message: 'Categoría creada con éxito',
      category: newCategory
    });
  } catch (err) {
    next(err);
  }
}

// NUEVO CONTROLADOR PARA LISTAR CATEGORÍAS
export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    // Si la ruta incluye ?type=expense, lo usamos. Si no, traemos todas o por defecto 'expense'
    const type = req.query.type as string | undefined; 
    
    // Llamamos al servicio que vamos a crear en el siguiente paso
    const categories = await dashboardService.getCategories(userId, type);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}