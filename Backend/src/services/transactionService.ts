import { transactionRepository } from '../repositories/transactionRepository';
import { AppError } from '../middlewares/errorHandler';
import { TransactionWithCategory, CreateTransactionResult } from '../models/types';
import { CreateTransactionBody, ListTransactionsQuery } from '../validators/transactionValidators';

export const transactionService = {

  async getAll(userId: string, query: ListTransactionsQuery): Promise<TransactionWithCategory[]> {
    return transactionRepository.findByUserId(userId, {
      month:       query.month,
      category_id: query.category_id,
      type:        query.type,
      limit:       query.limit,
      offset:      query.offset,
    });
  },

  async create(userId: string, data: CreateTransactionBody): Promise<CreateTransactionResult> {
    // Validar categoría si se proporcionó
    if (data.category_id) {
      const valid = await transactionRepository.categoryExistsForUser(data.category_id, userId);
      if (!valid) throw new AppError(400, 'La categoría no existe o no está disponible para este usuario');
    }

    // createWithBalance inserta y calcula el saldo en la misma transacción de BD
    return transactionRepository.createWithBalance(userId, data);
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await transactionRepository.softDelete(id, userId);
    if (!deleted) throw new AppError(404, 'Transacción no encontrada');
  },
};
