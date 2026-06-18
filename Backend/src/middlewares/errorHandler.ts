import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Errores de validación de pg (constraint violations, etc.)
  if (err instanceof Error && 'code' in err) {
    const pgErr = err as NodeJS.ErrnoException;
    if (pgErr.code === '23505') {
      res.status(409).json({ error: 'El recurso ya existe' });
      return;
    }
    if (pgErr.code === '23503') {
      res.status(400).json({ error: 'Referencia inválida' });
      return;
    }
  }

  console.error('[Error]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
