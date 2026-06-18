import { Request, Response, NextFunction } from 'express';
import { goalService } from '../services/goalService';
import { AuthRequest } from '../middlewares/authenticate';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await goalService.getAll((req as AuthRequest).userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await goalService.getOne(req.params.id, (req as AuthRequest).userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await goalService.create((req as AuthRequest).userId, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await goalService.update(req.params.id, (req as AuthRequest).userId, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await goalService.remove(req.params.id, (req as AuthRequest).userId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function addContribution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await goalService.addContribution(
      req.params.id,
      (req as AuthRequest).userId,
      req.body,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}
