import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { pool } from '../config/database';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middlewares/errorHandler';
import { RegisterDTO, LoginDTO, AuthTokens, UserPublic } from '../models/types';

const SALT_ROUNDS = 12;

function generateTokens(userId: string): AuthTokens {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const hash      = await bcrypt.hash(token, 8);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt],
  );
}

function stripPassword(user: Awaited<ReturnType<typeof userRepository.findByEmail>>): UserPublic {
  if (!user) throw new AppError(500, 'Error interno');
  const { password_hash: _, ...pub } = user;
  return pub;
}

export const authService = {

  async register(data: RegisterDTO): Promise<{ user: UserPublic; tokens: AuthTokens }> {
    // 1. Extraemos categorias y metas
    const { categorias, metas, ...userData } = data;
    
    const email = userData.email.toLowerCase().trim();

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new AppError(409, 'El correo ya está registrado');

    const password_hash = await bcrypt.hash(userData.password, SALT_ROUNDS);
    
    // 2. Preparamos datos faltantes
    const full_name = userData.full_name || email.split('@')[0];
    const monthly_income = userData.monthly_income || 0;

    // 3. Creamos al usuario
    const user = await userRepository.create({ 
      ...userData, 
      email, 
      password_hash,
      full_name,
      monthly_income 
    });

    // 4. --- MAGIA DEL PERFILAMIENTO ---
    if (categorias || metas) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const date = new Date();
        const currentMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);

        // Guardar cada categoría y su presupuesto
        if (categorias && categorias.length > 0) {
          for (const cat of categorias) {
            if (cat.monto > 0) {
              const catCheck = await client.query(
                `SELECT id FROM categories WHERE name = $1 AND (user_id IS NULL OR user_id = $2) LIMIT 1`,
                [cat.nombre, user.id]
              );
              
              let catId;
              if (catCheck.rows.length > 0) {
                catId = catCheck.rows[0].id;
              } else {
                const newCat = await client.query(
                  `INSERT INTO categories (user_id, name, icon, type) VALUES ($1, $2, $3, 'expense') RETURNING id`,
                  [user.id, cat.nombre, cat.icono || '🏷️']
                );
                catId = newCat.rows[0].id;
              }

              await client.query(
                `INSERT INTO monthly_budgets (user_id, category_id, amount, month) VALUES ($1, $2, $3, $4)`,
                [user.id, catId, cat.monto, currentMonth]
              );
            }
          }
        }

        // Guardar cada meta de ahorro
        if (metas && metas.length > 0) {
          for (const meta of metas) {
            if (meta.montoTotal > 0) {
              await client.query(
                `INSERT INTO goals (user_id, title, icon, target_amount, current_amount, status) VALUES ($1, $2, $3, $4, 0, 'active')`,
                [user.id, meta.nombre, '🎯', meta.montoTotal]
              );
            }
          }
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creando perfil financiero detallado:', err);
      } finally {
        client.release();
      }
    }

    // 5. Generamos tokens y retornamos
    const tokens = generateTokens(user.id);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user: stripPassword(user), tokens };
  },

  async login(data: LoginDTO): Promise<{ user: UserPublic; tokens: AuthTokens }> {
    const email = data.email.toLowerCase().trim();
    const user  = await userRepository.findByEmail(email);

    if (!user) {
      await bcrypt.hash(data.password, SALT_ROUNDS); 
      throw new AppError(401, 'Credenciales inválidas');
    }

    const valid = await bcrypt.compare(data.password, user.password_hash);
    if (!valid) throw new AppError(401, 'Credenciales inválidas');

    const tokens = generateTokens(user.id);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user: stripPassword(user), tokens };
  },

  async refresh(token: string): Promise<AuthTokens> {
    let payload: { sub: string; type?: string };
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; type?: string };
    } catch {
      throw new AppError(401, 'Refresh token inválido o expirado');
    }

    if (payload.type !== 'refresh') {
      throw new AppError(401, 'El token proporcionado no es un refresh token');
    }

    const { rows } = await pool.query<{ id: string; token_hash: string }>(
      `SELECT id, token_hash FROM refresh_tokens
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 10`,
      [payload.sub],
    );

    if (rows.length === 0) throw new AppError(401, 'Sesión no encontrada o expirada');

    let matchedId: string | null = null;
    for (const row of rows) {
      const ok = await bcrypt.compare(token, row.token_hash);
      if (ok) { matchedId = row.id; break; }
    }

    if (!matchedId) throw new AppError(401, 'Refresh token no reconocido');

    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [matchedId]);

    const newTokens = generateTokens(payload.sub);
    await saveRefreshToken(payload.sub, newTokens.refreshToken);
    return newTokens;
  },

  async logout(userId: string): Promise<void> {
    await pool.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    );
  },

  async saveFinancialProfile(userId: string, categorias?: any[], metas?: any[]): Promise<void> {
    if (!categorias && !metas) return;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const currentMonth = new Date().toISOString().slice(0, 10);

      if (categorias && categorias.length > 0) {
        for (const cat of categorias) {
          if (cat.monto > 0) {
            const catCheck = await client.query(
              `SELECT id FROM categories WHERE name = $1 AND (user_id IS NULL OR user_id = $2) LIMIT 1`,
              [cat.nombre, userId]
            );
            let catId;
            if (catCheck.rows.length > 0) {
              catId = catCheck.rows[0].id;
            } else {
              const newCat = await client.query(
                `INSERT INTO categories (user_id, name, icon, type) VALUES ($1, $2, $3, 'expense') RETURNING id`,
                [userId, cat.nombre, cat.icono || '🏷️']
              );
              catId = newCat.rows[0].id;
            }
            await client.query(
              `INSERT INTO monthly_budgets (user_id, category_id, amount, month) VALUES ($1, $2, $3, $4)`,
              [userId, catId, cat.monto, currentMonth]
            );
          }
        }
      }

      if (metas && metas.length > 0) {
        for (const meta of metas) {
          if (meta.montoTotal > 0) {
            await client.query(
              `INSERT INTO goals (user_id, title, icon, target_amount, current_amount, status) VALUES ($1, $2, $3, $4, 0, 'active')`,
              [userId, meta.nombre, '🎯', meta.montoTotal]
            );
          }
        }
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error guardando perfil financiero:', err);
    } finally {
      client.release();
    }
  },
};