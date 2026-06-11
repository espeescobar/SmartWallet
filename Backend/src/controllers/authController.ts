import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { userRepository } from '../repositories/userRepository';
import { AuthRequest } from '../middlewares/authenticate';
import { RegisterBody, LoginBody, UpdateMeBody } from '../validators/authValidators';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body   = req.body as RegisterBody;
    const result = await authService.register(body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body   = req.body as LoginBody;
    const result = await authService.login(body);
    res.json(result);
  } catch (err) { next(err); }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };
    const tokens = await authService.refresh(token);
    res.json(tokens);
  } catch (err) { next(err); }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logout((req as AuthRequest).userId);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await userRepository.findById((req as AuthRequest).userId);
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    const { password_hash: _, ...userPublic } = user;
    res.json(userPublic);
  } catch (err) { next(err); }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as UpdateMeBody;
    const userId = (req as AuthRequest).userId;
    
    // 1. Separamos los datos de presupuesto de los datos normales del usuario
    const { categorias, metas, ...userUpdates } = body;

    // 2. Actualizamos el ingreso mensual y nombre en la tabla users
    const user = await userRepository.update(userId, userUpdates);
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

    // 3. ✨ LLAMAMOS A LA MAGIA DEL PRESUPUESTO ✨
    await authService.saveFinancialProfile(userId, categorias, metas);

    const { password_hash: _, ...userPublic } = user;
    res.json(userPublic);
  } catch (err) { next(err); }
}
