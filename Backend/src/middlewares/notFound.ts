import { Request, Response } from 'express';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `${req.method} ${req.path} no encontrado` });
}
