import { pool } from '../config/database';
import { Goal, GoalContribution, CreateGoalDTO, UpdateGoalDTO, CreateContributionDTO } from '../models/types';

export const goalRepository = {

  async findByUserId(userId: string): Promise<Goal[]> {
    const { rows } = await pool.query<Goal>(
      `SELECT * FROM goals
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  },

  async findById(id: string, userId: string): Promise<Goal | null> {
    const { rows } = await pool.query<Goal>(
      'SELECT * FROM goals WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );
    return rows[0] ?? null;
  },

  async create(userId: string, data: CreateGoalDTO): Promise<Goal> {
    const { rows } = await pool.query<Goal>(
      `INSERT INTO goals (user_id, title, icon, target_amount, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, data.title, data.icon ?? '🎯', data.target_amount, data.deadline ?? null],
    );
    return rows[0];
  },

  async update(id: string, userId: string, data: UpdateGoalDTO): Promise<Goal | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.title         !== undefined) { fields.push(`title = $${i++}`);         values.push(data.title); }
    if (data.icon          !== undefined) { fields.push(`icon = $${i++}`);           values.push(data.icon); }
    if (data.target_amount !== undefined) { fields.push(`target_amount = $${i++}`);  values.push(data.target_amount); }
    if (data.deadline      !== undefined) { fields.push(`deadline = $${i++}`);       values.push(data.deadline); }
    if (data.status        !== undefined) { fields.push(`status = $${i++}`);         values.push(data.status); }

    if (fields.length === 0) return this.findById(id, userId);

    values.push(id, userId);
    const { rows } = await pool.query<Goal>(
      `UPDATE goals SET ${fields.join(', ')}
       WHERE id = $${i++} AND user_id = $${i} AND deleted_at IS NULL
       RETURNING *`,
      values,
    );
    return rows[0] ?? null;
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'UPDATE goals SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  },

  async addContribution(goalId: string, userId: string, data: CreateContributionDTO): Promise<GoalContribution> {
    // El trigger sync_goal_amount_on_contribution en PostgreSQL actualiza goals.current_amount
    const { rows } = await pool.query<GoalContribution>(
      `INSERT INTO goal_contributions (goal_id, user_id, amount, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [goalId, userId, data.amount, data.note ?? null],
    );
    return rows[0];
  },

  async findContributions(goalId: string): Promise<GoalContribution[]> {
    const { rows } = await pool.query<GoalContribution>(
      'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY contributed_at DESC',
      [goalId],
    );
    return rows;
  },
};
