import dotenv from 'dotenv';

dotenv.config();

/** Variable requerida — lanza si no está definida */
function get(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable de entorno requerida no definida: ${key}`);
  }
  return value;
}

/** Variable opcional — devuelve undefined si no está definida */
function optional(key: string): string | undefined {
  return process.env[key];
}

export const env = {
  NODE_ENV: get('NODE_ENV', 'development'),
  PORT:     parseInt(get('PORT', '3000'), 10),

  // ── PostgreSQL ────────────────────────────────────────────────────
  // DATABASE_URL tiene precedencia; si no está, se usan las vars individuales
  DATABASE_URL: optional('DATABASE_URL'),
  DB_HOST:      get('DB_HOST',  'localhost'),
  DB_PORT:      parseInt(get('DB_PORT', '5432'), 10),
  DB_NAME:      get('DB_NAME'),
  DB_USER:      get('DB_USER'),
  DB_PASSWORD:  get('DB_PASSWORD'),

  // ── JWT ───────────────────────────────────────────────────────────
  JWT_SECRET:             get('JWT_SECRET'),
  JWT_EXPIRES_IN:         get('JWT_EXPIRES_IN',         '7d'),
  JWT_REFRESH_EXPIRES_IN: get('JWT_REFRESH_EXPIRES_IN', '30d'),

  // ── CORS ──────────────────────────────────────────────────────────
  CORS_ORIGIN: get('CORS_ORIGIN', '*'),

  // ── Chatbot ───────────────────────────────────────────────────────
  // Opcional: solo requerido cuando el módulo de chat esté activo
  OPENAI_API_KEY: optional('OPENAI_API_KEY'),
} as const;
