import { Pool, PoolClient } from 'pg';
import { env } from './env';

// Si DATABASE_URL está definida, úsala directamente (Railway, Render, EC2 con RDS, etc.)
// Si no, usa las variables individuales DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD
const connectionConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host:     env.DB_HOST,
      port:     env.DB_PORT,
      database: env.DB_NAME,
      user:     env.DB_USER,
      password: env.DB_PASSWORD,
    };

export const pool = new Pool({
  ...connectionConfig,
  max:                    10,   // conexiones simultáneas máximas
  idleTimeoutMillis:  30_000,   // cerrar conexiones inactivas después de 30 s
  connectionTimeoutMillis: 2_000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[Pool] Error inesperado en cliente inactivo:', err);
});

export async function testConnection(): Promise<void> {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    const source = env.DATABASE_URL ? 'DATABASE_URL' : `${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
    console.log(`✓ PostgreSQL conectado (${source})`);
  } finally {
    client?.release();
  }
}
