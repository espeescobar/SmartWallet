import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

interface JwtPayload {
  sub: string;  // user UUID
  iat: number;
  exp: number;
}

/** Request con userId inyectado por el middleware de autenticación */
export interface AuthRequest extends Request {
  userId: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token de acceso requerido'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthRequest).userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}
