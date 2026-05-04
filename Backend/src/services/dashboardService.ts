import { pool } from '../config/database';
import { DashboardSummary, CategorySummary } from '../models/types';

export const dashboardService = {

  async getSummary(userId: string, month?: string): Promise<DashboardSummary> {
    // Default: mes actual en formato "YYYY-MM"
    const targetMonth = month ?? new Date().toISOString().slice(0, 7);
    const monthDate = `${targetMonth}-01`;

    // Totales de ingresos y egresos del mes
    const { rows: totals } = await pool.query<{ type: string; total: string }>(
      `SELECT type, COALESCE(SUM(amount), 0)::text AS total
       FROM transactions
       WHERE user_id = $1
         AND TO_CHAR(transaction_date, 'YYYY-MM') = $2
         AND deleted_at IS NULL
       GROUP BY type`,
      [userId, targetMonth],
    );

    const total_income   = parseInt(totals.find(r => r.type === 'income')?.total  ?? '0', 10);
    const total_expenses = parseInt(totals.find(r => r.type === 'expense')?.total ?? '0', 10);

    // Gastos por categoría + presupuesto asignado
    const { rows: cats } = await pool.query<CategorySummary>(
      `SELECT
          t.category_id,
          c.name  AS category_name,
          c.icon  AS category_icon,
          c.color AS category_color,
          SUM(t.amount)::int          AS total_amount,
          COUNT(*)::int               AS transaction_count,
          mb.amount                   AS budget_amount
       FROM transactions t
       LEFT JOIN categories    c  ON c.id  = t.category_id
       LEFT JOIN monthly_budgets mb ON mb.category_id = t.category_id
                                    AND mb.user_id     = t.user_id
                                    AND mb.month       = $3::date
       WHERE t.user_id = $1
         AND TO_CHAR(t.transaction_date, 'YYYY-MM') = $2
         AND t.type        = 'expense'
         AND t.deleted_at IS NULL
       GROUP BY t.category_id, c.name, c.icon, c.color, mb.amount
       ORDER BY total_amount DESC`,
      [userId, targetMonth, monthDate],
    );

    return {
      month:  targetMonth,
      total_income,
      total_expenses,
      balance: total_income - total_expenses,
      categories: cats,
    };
  }, // <-- AQUÍ TERMINA getSummary

  // NUEVO SERVICIO PARA OBTENER LAS CATEGORÍAS DEL USUARIO (AHORA SÍ ESTÁ AFUERA)
  async getCategories(userId: string, type?: string) {
    let query = `
      SELECT id, name, icon, color 
      FROM categories 
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    // Si enviamos un tipo específico (como 'expense' desde FormGastos), filtramos por eso
    if (type) {
      query += ` AND type = $2`;
      params.push(type);
    }

    query += ` ORDER BY name ASC`;

    const { rows } = await pool.query(query, params);
    return rows;
  }, // <-- COMA PARA SEPARAR FUNCIONES

  // NUEVO METODO PARA CREAR CATEGORIAS CON PRESUPUESTO
  async createCategory(userId: string, data: { name: string; type: string; budget_amount?: number; icon?: string; color?: string }) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // Iniciamos la transacción

      const categoryResult = await client.query(
        `INSERT INTO categories (user_id, name, icon, color, type, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, icon, color, type`,
        [userId, data.name, data.icon || '🏷️', data.color || '#005AD6', data.type, false]
      );

      const newCategory = categoryResult.rows[0];

      if (data.budget_amount !== undefined && data.budget_amount >= 0) {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        await client.query(
          `INSERT INTO monthly_budgets (user_id, category_id, amount, month)
           VALUES ($1, $2, $3, $4)`,
          [userId, newCategory.id, data.budget_amount, firstDayOfMonth]
        );
      }

      await client.query('COMMIT'); 
      return newCategory;

    } catch (error) {
      await client.query('ROLLBACK'); 
      throw error;
    } finally {
      client.release(); 
    }
  }
};