import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService';
import { AuthRequest } from '../middlewares/authenticate';
import { CreateTransactionBody, ListTransactionsQuery } from '../validators/transactionValidators';

/**
 * GET /api/v1/transactions
 * Query params: month, category_id, type, limit, offset
 * (validados y tipados por validateQuery antes de llegar aquí)
 */
export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = res.locals.query as ListTransactionsQuery;
    const data  = await transactionService.getAll((req as AuthRequest).userId, query);
    res.json(data);
  } catch (err) { next(err); }
}

/**
 * POST /api/v1/transactions
 * Body validado por validateBody(createTransactionSchema).
 * Responde 201 con { transaction, balance } donde balance es el saldo del mes actualizado.
 */
export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body   = req.body as CreateTransactionBody;
    const result = await transactionService.create((req as AuthRequest).userId, body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

/**
 * DELETE /api/v1/transactions/:id
 * Soft-delete: la fila queda en la BD con deleted_at seteado.
 */
export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await transactionService.remove(req.params.id, (req as AuthRequest).userId);
    res.status(204).send();
  } catch (err) { next(err); }
}
