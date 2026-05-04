import { goalRepository } from '../repositories/goalRepository';
import { AppError } from '../middlewares/errorHandler';
import { Goal, GoalContribution, CreateGoalDTO, UpdateGoalDTO, CreateContributionDTO } from '../models/types';

export const goalService = {

  async getAll(userId: string): Promise<Goal[]> {
    return goalRepository.findByUserId(userId);
  },

  async getOne(id: string, userId: string): Promise<Goal> {
    const goal = await goalRepository.findById(id, userId);
    if (!goal) throw new AppError(404, 'Meta no encontrada');
    return goal;
  },

  async create(userId: string, data: CreateGoalDTO): Promise<Goal> {
    if (data.target_amount <= 0) throw new AppError(400, 'El monto objetivo debe ser mayor a 0');
    return goalRepository.create(userId, data);
  },

  async update(id: string, userId: string, data: UpdateGoalDTO): Promise<Goal> {
    const goal = await goalRepository.update(id, userId, data);
    if (!goal) throw new AppError(404, 'Meta no encontrada');
    return goal;
  },

  async remove(id: string, userId: string): Promise<void> {
    const deleted = await goalRepository.softDelete(id, userId);
    if (!deleted) throw new AppError(404, 'Meta no encontrada');
  },

  async addContribution(goalId: string, userId: string, data: CreateContributionDTO): Promise<GoalContribution> {
    const goal = await goalRepository.findById(goalId, userId);
    if (!goal) throw new AppError(404, 'Meta no encontrada');
    if (goal.status === 'cancelled') throw new AppError(400, 'No se puede aportar a una meta cancelada');

    // Evitar que el saldo quede negativo por un retiro
    if (data.amount < 0 && goal.current_amount + data.amount < 0) {
      throw new AppError(400, 'El retiro supera el monto acumulado');
    }

    return goalRepository.addContribution(goalId, userId, data);
  },
};
