import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z
    .number({ error: 'El monto es requerido y debe ser un número' })
    .int('El monto debe ser un número entero (CLP no tiene decimales)')
    .positive('El monto debe ser mayor a 0'),

  type: z.enum(['income', 'expense'], {
    error: 'El tipo debe ser "income" (ingreso) o "expense" (gasto)',
  }),

  category_id: z
    .string()
    .uuid('El ID de categoría no es un UUID válido')
    .optional(),

  description: z
    .string()
    .max(255, 'La descripción no puede superar 255 caracteres')
    .transform(v => v.trim())
    .optional(),

  // Acepta YYYY-MM-DD y valida que sea una fecha real
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD')
    .refine(v => !isNaN(Date.parse(v)), 'La fecha no corresponde a un día válido')
    .optional(),
});

// Los query params de Express llegan como strings; zod los coerciona
export const listTransactionsQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'El mes debe estar en formato YYYY-MM (ej: 2025-05)')
    .optional(),

  category_id: z
    .string()
    .uuid('El ID de categoría no es un UUID válido')
    .optional(),

  type: z.enum(['income', 'expense']).optional(),

  limit: z.coerce
    .number()
    .int()
    .min(1,   'El límite mínimo es 1')
    .max(100, 'El límite máximo por página es 100')
    .default(50),

  offset: z.coerce
    .number()
    .int()
    .min(0, 'El offset no puede ser negativo')
    .default(0),
});

export type CreateTransactionBody   = z.infer<typeof createTransactionSchema>;
export type ListTransactionsQuery   = z.infer<typeof listTransactionsQuerySchema>;
