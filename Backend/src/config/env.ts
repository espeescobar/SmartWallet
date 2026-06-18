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

  // ── Chatbot / LLM ─────────────────────────────────────────────────
  // Capa agnóstica de proveedor. Por defecto Groq (gratis, API compatible
  // con OpenAI). Si no hay LLM_API_KEY, el chat responde con un fallback.
  // Ver docs/chatbot-arquitectura.md (sección 5).
  LLM_PROVIDER: get('LLM_PROVIDER', 'groq'),
  LLM_API_KEY:  optional('LLM_API_KEY') ?? optional('GROQ_API_KEY') ?? optional('OPENAI_API_KEY'),
  LLM_MODEL:    get('LLM_MODEL',    'llama-3.3-70b-versatile'),
  LLM_BASE_URL: get('LLM_BASE_URL', 'https://api.groq.com/openai/v1'),
} as const;
