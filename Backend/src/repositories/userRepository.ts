import { pool } from '../config/database';
import { User, RegisterDTO } from '../models/types';

export const userRepository = {

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email],
    );
    return rows[0] ?? null;
  },

  async create(data: RegisterDTO & { password_hash: string }): Promise<User> {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (email, password_hash, full_name, monthly_income)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email, data.password_hash, data.full_name, data.monthly_income ?? 0],
    );
    return rows[0];
  },

  async update(id: string, data: Partial<Pick<User, 'full_name' | 'avatar_url' | 'monthly_income'>>): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (data.full_name      !== undefined) { fields.push(`full_name = $${i++}`);      values.push(data.full_name); }
    if (data.avatar_url     !== undefined) { fields.push(`avatar_url = $${i++}`);     values.push(data.avatar_url); }
    if (data.monthly_income !== undefined) { fields.push(`monthly_income = $${i++}`); values.push(data.monthly_income); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      values,
    );
    return rows[0] ?? null;
  },
};
