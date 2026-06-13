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

    // Gastos por categoría + presupuesto asignado + historial de transacciones (TODO EN UNO)
    const categoriesQuery = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(SUM(t.amount), 0)::int AS total_amount,
        COUNT(t.id)::int AS transaction_count,
        mb.amount AS budget_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'description', t.description,
              'amount', t.amount,
              'date', t.transaction_date
            )
          ) FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS transactions
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id 
        AND t.user_id = $1 
        AND TO_CHAR(t.transaction_date, 'YYYY-MM') = $2
        AND t.deleted_at IS NULL
        AND t.type = 'expense'
      LEFT JOIN monthly_budgets mb ON mb.category_id = c.id
        AND mb.user_id = $1
        AND mb.month = $3::date
      WHERE c.user_id = $1 AND c.type = 'expense'
      GROUP BY c.id, c.name, c.icon, c.color, mb.amount
      HAVING COUNT(t.id) > 0
      ORDER BY total_amount DESC;
    `;

    
    const { rows: categoriesRows } = await pool.query(categoriesQuery, [userId, targetMonth, monthDate]);

    const categoriesFormatted = categoriesRows.map(cat => ({
      ...cat,
      category_color: cat.category_color || '#005AD6', 
    }));

    return {
      month:  targetMonth,
      total_income,
      total_expenses,
      balance: total_income - total_expenses,
      categories: categoriesFormatted // Eliminado el "cats" duplicado
    };
  }, 
  async getCategories(userId: string, type?: string) {
    const params: any[] = [userId];
    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.icon, 
        c.color,
        mb.amount AS budget_amount
      FROM categories c
      LEFT JOIN monthly_budgets mb 
        ON mb.category_id = c.id 
        AND mb.user_id = $1
        AND mb.month = DATE_TRUNC('month', CURRENT_DATE)::DATE
      WHERE c.user_id = $1
    `;

    // Si enviamos un tipo específico (como 'expense'), filtramos por eso
    if (type) {
      query += ` AND c.type = $2`;
      params.push(type);
    }

    query += ` ORDER BY c.name ASC`;

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