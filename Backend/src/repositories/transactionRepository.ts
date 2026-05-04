import { PoolClient } from 'pg';
import { pool } from '../config/database';
import {
  Transaction,
  TransactionWithCategory,
  CreateTransactionDTO,
  MonthBalance,
  CreateTransactionResult,
} from '../models/types';

// ─── helpers internos ─────────────────────────────────────────────────────────

/** Devuelve la transacción con datos de su categoría usando el cliente dado */
async function fetchWithCategory(
  client: PoolClient,
  txId: string,
): Promise<TransactionWithCategory> {
  const { rows } = await client.query<TransactionWithCategory>(
    `SELECT t.*,
            c.name  AS category_name,
            c.icon  AS category_icon,
            c.color AS category_color
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.id = $1`,
    [txId],
  );
  return rows[0];
}

/** Calcula los totales del mes para un usuario (usa el cliente dado para estar en la misma tx) */
async function computeMonthBalance(
  client: PoolClient,
  userId: string,
  month: string,   // "YYYY-MM"
): Promise<MonthBalance> {
  const { rows } = await client.query<{ total_income: string; total_expenses: string }>(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE type = 'income'  AND deleted_at IS NULL), 0)::bigint::text AS total_income,
       COALESCE(SUM(amount) FILTER (WHERE type = 'expense' AND deleted_at IS NULL), 0)::bigint::text AS total_expenses
     FROM transactions
     WHERE user_id = $1
       AND TO_CHAR(transaction_date, 'YYYY-MM') = $2`,
    [userId, month],
  );
  const totalIncome   = parseInt(rows[0].total_income,   10);
  const totalExpenses = parseInt(rows[0].total_expenses, 10);
  return {
    month,
    total_income:   totalIncome,
    total_expenses: totalExpenses,
    available:      totalIncome - totalExpenses,
  };
}

// ─── repositorio ─────────────────────────────────────────────────────────────

export const transactionRepository = {

  /** Lista transacciones activas del usuario con filtros opcionales */
  async findByUserId(
    userId: string,
    opts: {
      month?:       string;
      category_id?: string;
      type?:        'income' | 'expense';
      limit?:       number;
      offset?:      number;
    } = {},
  ): Promise<TransactionWithCategory[]> {
    const conditions: string[] = ['t.user_id = $1', 't.deleted_at IS NULL'];
    const values: unknown[]   = [userId];

    // Acumular filtros: push value primero, luego values.length da el índice correcto
    if (opts.month) {
      values.push(opts.month);
      conditions.push(`TO_CHAR(t.transaction_date, 'YYYY-MM') = $${values.length}`);
    }
    if (opts.category_id) {
      values.push(opts.category_id);
      conditions.push(`t.category_id = $${values.length}`);
    }
    if (opts.type) {
      values.push(opts.type);
      conditions.push(`t.type = $${values.length}`);
    }

    values.push(opts.limit ?? 50);
    const limitParam = values.length;
    values.push(opts.offset ?? 0);
    const offsetParam = values.length;

    const { rows } = await pool.query<TransactionWithCategory>(
      `SELECT t.*,
              c.name  AS category_name,
              c.icon  AS category_icon,
              c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      values,
    );
    return rows;
  },

  async findById(id: string, userId: string): Promise<TransactionWithCategory | null> {
    const { rows } = await pool.query<TransactionWithCategory>(
      `SELECT t.*,
              c.name  AS category_name,
              c.icon  AS category_icon,
              c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL`,
      [id, userId],
    );
    return rows[0] ?? null;
  },

  /**
   * Crea la transacción y devuelve, en la misma transacción de BD, el saldo
   * actualizado del mes. Garantiza atomicidad: si falla el cálculo del saldo,
   * el INSERT también se revierte.
   */
  async createWithBalance(
    userId: string,
    data: CreateTransactionDTO,
  ): Promise<CreateTransactionResult> {
    const client  = await pool.connect();
    const txDate  = data.transaction_date ?? new Date().toISOString().slice(0, 10);
    const month   = txDate.slice(0, 7); // "YYYY-MM"

    try {
      await client.query('BEGIN');

      // 1. Insertar transacción
      const { rows: [tx] } = await client.query<Transaction>(
        `INSERT INTO transactions
           (user_id, category_id, amount, type, description, transaction_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          data.category_id   ?? null,
          data.amount,
          data.type,
          data.description   ?? null,
          txDate,
        ],
      );

      // 2. Obtener fila completa con datos de categoría
      const transaction = await fetchWithCategory(client, tx.id);

      // 3. Calcular saldo del mes —ya incluye la fila recién insertada—
      const balance = await computeMonthBalance(client, userId, month);

      await client.query('COMMIT');
      return { transaction, balance };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  /** Soft-delete: marca deleted_at sin borrar el registro */
  async softDelete(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE transactions
       SET deleted_at = NOW()
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  },

  /** Verifica que una categoría exista y sea accesible para el usuario
   *  (categoría del sistema user_id=NULL ó propia del usuario) */
  async categoryExistsForUser(categoryId: string, userId: string): Promise<boolean> {
    const { rows } = await pool.query(
      `SELECT 1 FROM categories
       WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
       LIMIT 1`,
      [categoryId, userId],
    );
    return rows.length > 0;
  },
};
