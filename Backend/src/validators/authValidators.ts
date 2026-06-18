import { z } from 'zod';

// ─── Helpers reutilizables ────────────────────────────────────────────────────

// zod v4: usa { error: '...' } en lugar de { required_error: '...' }
const emailField = z
  .string({ error: 'El email es requerido' })
  .min(1,  'El email es requerido')
  .email('Formato de email inválido')
  .transform(v => v.toLowerCase().trim());

const passwordField = (label = 'La contraseña') =>
  z
    .string({ error: `${label} es requerida` })
    .min(1,  `${label} es requerida`)
    .min(8,  `${label} debe tener al menos 8 caracteres`)
    .max(72, `${label} no puede superar 72 caracteres`); // bcrypt trunca a 72 bytes

// ─── Schemas por endpoint ─────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: emailField,

  password: passwordField()
    .regex(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .regex(/[0-9]/,    'La contraseña debe contener al menos un número'),

  // Lo hacemos opcional para que no bloquee el registro si el frontend no lo envía
  full_name: z
    .string({ error: 'El nombre es requerido' })
    .min(2,   'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .transform(v => v.trim()),

  monthly_income: z
    .number()
    .int('El ingreso mensual debe ser un número entero (CLP)')
    .min(0, 'El ingreso mensual no puede ser negativo')
    .optional(),

  // ✨ AQUÍ AGREGAMOS EL PERFIL FINANCIERO ✨
  perfil: z.object({
    ingresos: z.number().optional(),
    gastos: z.number().optional(),
    cuentasBasicas: z.number().optional(),
    objetivosAhorro: z.number().optional(),
  }).optional(),
});

export const loginSchema = z.object({
  email:    emailField,
  password: passwordField(),
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ error: 'El refresh token es requerido' })
    .min(1, 'El refresh token es requerido'),
});

export const updateMeSchema = z.object({
  full_name: z
    .string()
    .min(2,   'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres')
    .transform(v => v.trim())
    .optional(),

  avatar_url: z
    .string()
    .url('La URL del avatar no es válida')
    .nullable()
    .optional(),

  monthly_income: z
    .number()
    .int('El ingreso mensual debe ser un número entero (CLP)')
    .min(0, 'El ingreso mensual no puede ser negativo')
    .optional(),
});

// Tipos inferidos — útiles para tipar req.body en los controllers
export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody    = z.infer<typeof loginSchema>;
export type UpdateMeBody = z.infer<typeof updateMeSchema>;