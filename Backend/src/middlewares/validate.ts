import { Request, Response, NextFunction } from 'express';
import { z, ZodTypeAny } from 'zod';

/**
 * Middleware factory: valida req.query contra un schema zod.
 * Guarda el resultado en res.locals.query para que el controller lo consuma tipado.
 * No modifica req.query directamente (evita conflictos de tipo con ParsedQs).
 */
export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      res.status(400).json({ error: 'Parámetros de consulta inválidos', details });
      return;
    }

    res.locals.query = result.data as z.infer<T>;
    next();
  };
}

/**
 * Middleware factory: valida req.body contra un schema zod.
 * Si falla, responde 400 con el detalle de cada campo inválido.
 * Si pasa, reemplaza req.body con el valor parseado/transformado (e.g. email lowercase).
 */
export function validateBody<T extends ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      res.status(400).json({ error: 'Datos de entrada inválidos', details });
      return;
    }

    // Reemplazar con el valor ya transformado por zod (trim, lowercase, etc.)
    req.body = result.data as z.infer<T>;
    next();
  };
}
