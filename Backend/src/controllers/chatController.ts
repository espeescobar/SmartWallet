import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chatService';
import { AuthRequest } from '../middlewares/authenticate';
import { AppError } from '../middlewares/errorHandler';

export async function getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await chatService.getSessions((req as AuthRequest).userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await chatService.createSession((req as AuthRequest).userId);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await chatService.getMessages(req.params.id, (req as AuthRequest).userId);
    res.json(data);
  } catch (err) { next(err); }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content } = req.body as { content: string };
    if (!content?.trim()) return next(new AppError(400, 'El mensaje no puede estar vacío'));
    const data = await chatService.sendMessage(req.params.id, (req as AuthRequest).userId, content);
    res.status(201).json(data);
  } catch (err) { next(err); }
}
