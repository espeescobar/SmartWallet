import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';


dotenv.config();

const connectionConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host:     process.env.DB_HOST || 'localhost',
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'smartwallet_db',
      user:     process.env.DB_USER || 'tu_usuario',
      password: process.env.DB_PASSWORD || 'tu_password',
    };

const pool = new Pool(connectionConfig);

// Email único del usuario demo. Se usa tanto para limpiar como para insertar,
// así la seed es idempotente (se puede correr varias veces sin duplicar).
const DEMO_EMAIL = 'catarojas@gmail.com';
const MONTHLY_INCOME = 850000; // CLP — usado por el dashboard y como sueldo mensual
const MONTHS_OF_HISTORY = 9;

// PRNG determinista (mulberry32): la misma semilla genera siempre los mismos
// datos, para que la demo sea reproducible entre corridas.
let rngState = 42;
function rand(): number {
  rngState |= 0;
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

// Monto aleatorio en un rango, redondeado a la centena (montos CLP "lindos").
function randAmount(min: number, max: number): number {
  const v = Math.floor(rand() * (max - min + 1)) + min;
  return Math.round(v / 100) * 100;
}

// Formatea una fecha como YYYY-MM-DD usando componentes LOCALES.
// (No usar toISOString(): convierte a UTC y, en husos negativos, corre la
//  fecha al día/mes siguiente para horas tardías.)
function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Perfil de cada categoría de gasto: rango de montos, frecuencia relativa
// (weight), presupuesto mensual y el % del presupuesto a consumir en el MES
// ACTUAL (ratio) para que las barras se vean variadas en la demo.
const expenseProfiles = [
  {
    name: 'Alimentación', icon: '🛒', color: '#34C759',
    budget: 220000, ratio: 0.92, min: 2500, max: 28000, weight: 5,
    descs: ['Supermercado', 'Almuerzo', 'Café', 'Delivery', 'Feria', 'Panadería', 'Onces con amigas'],
  },
  {
    name: 'Transporte', icon: '🚗', color: '#007AFF',
    budget: 110000, ratio: 1.06, min: 1500, max: 22000, weight: 4,
    descs: ['Uber', 'Bencina', 'Metro', 'Estacionamiento', 'Tag autopista', 'Micro'],
  },
  {
    name: 'Salud y Deporte', icon: '🚲', color: '#FF9500',
    budget: 95000, ratio: 0.6, min: 5000, max: 40000, weight: 2,
    descs: ['Gimnasio', 'Farmacia', 'Suplementos', 'Consulta médica', 'Clase de spinning'],
  },
  {
    name: 'Mascotas', icon: '🐶', color: '#AF52DE',
    budget: 75000, ratio: 0.4, min: 4000, max: 35000, weight: 2,
    descs: ['Comida para Rocky', 'Veterinaria', 'Juguete', 'Peluquería canina', 'Vacuna'],
  },
];

async function runSeed() {
  const client = await pool.connect();

  // id de categoría por nombre de perfil, para reutilizar en transacciones/presupuestos
  const categoryIdByName: Record<string, string> = {};
  let expenseCount = 0;
  let incomeCount = 0;

  // Inserta una transacción de gasto
  async function insertExpense(catId: string, amount: number, date: Date, description: string) {
    const day = fmtDate(date);
    await client.query(
      `INSERT INTO transactions (user_id, category_id, amount, transaction_date, description, type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'expense', $6, $6);`,
      [userId, catId, amount, day, description, date],
    );
    expenseCount++;
  }

  // Inserta una transacción de ingreso
  async function insertIncome(catId: string | null, amount: number, date: Date, description: string) {
    await client.query(
      `INSERT INTO transactions (user_id, category_id, amount, transaction_date, description, type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'income', $6, $6);`,
      [userId, catId, amount, fmtDate(date), description, date],
    );
    incomeCount++;
  }

  let userId = '';

  try {
    await client.query('BEGIN');

    console.log('🌱 Iniciando el seed de la base de datos...');

    // Limpiamos al usuario para evitar duplicados. El ON DELETE CASCADE del
    // esquema elimina sus categorías, transacciones, metas y aportes.
    await client.query(`DELETE FROM users WHERE email = $1`, [DEMO_EMAIL]);

    const today = new Date();
    const date9MonthsAgo = new Date();
    date9MonthsAgo.setMonth(date9MonthsAgo.getMonth() - MONTHS_OF_HISTORY);

    const date4MonthsAgo = new Date();
    date4MonthsAgo.setMonth(date4MonthsAgo.getMonth() - 4);

    // 1. Crear el usuario 'Cata' con la contraseña ENCRIPTADA
    const hashedPassword = await bcrypt.hash('Meev2003', 10);
    const userRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, monthly_income, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, ['Cata', DEMO_EMAIL, hashedPassword, MONTHLY_INCOME, date9MonthsAgo]);
    userId = userRes.rows[0].id;
    console.log(`✅ Usuario Cata creado con ID: ${userId}`);

    // 2. Crear las categorías de gasto (a partir de los perfiles)
    for (const p of expenseProfiles) {
      const catRes = await client.query(`
        INSERT INTO categories (user_id, name, type, icon, color, created_at)
        VALUES ($1, $2, 'expense', $3, $4, $5)
        RETURNING id;
      `, [userId, p.name, p.icon, p.color, date9MonthsAgo]);
      categoryIdByName[p.name] = catRes.rows[0].id;
    }
    console.log(`✅ ${expenseProfiles.length} categorías creadas`);

    // 3. Crear 2 objetivos de ahorro (con aporte inicial → trigger sincroniza current_amount)
    const goals = [
      { title: 'Fondo de Emergencia Anual', target_amount: 1200000, current_amount: 450000, deadline: new Date('2026-12-31'), icon: '🎯', createdAt: date9MonthsAgo },
      { title: 'Vacaciones de Verano', target_amount: 800000, current_amount: 300000, deadline: new Date('2027-01-15'), icon: '✈️', createdAt: date4MonthsAgo },
    ];
    for (const goal of goals) {
      const goalRes = await client.query(`
        INSERT INTO goals (user_id, title, target_amount, current_amount, deadline, icon, status, created_at, updated_at)
        VALUES ($1, $2, $3, 0, $4, $5, 'active', $6, $6)
        RETURNING id;
      `, [userId, goal.title, goal.target_amount, goal.deadline, goal.icon, goal.createdAt]);
      await client.query(`
        INSERT INTO goal_contributions (goal_id, user_id, amount, note, contributed_at)
        VALUES ($1, $2, $3, $4, $5);
      `, [goalRes.rows[0].id, userId, goal.current_amount, 'Aporte inicial (seed)', goal.createdAt]);
    }
    console.log('✅ 2 objetivos de ahorro creados (con aporte inicial)');

    // 4. Presupuestos mensuales por categoría (últimos N meses + mes actual).
    //    Necesarios para que las barras de presupuesto del dashboard tengan datos.
    let budgetCount = 0;
    for (let m = MONTHS_OF_HISTORY; m >= 0; m--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
      for (const p of expenseProfiles) {
        await client.query(`
          INSERT INTO monthly_budgets (user_id, category_id, amount, month)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, category_id, month) DO NOTHING;
        `, [userId, categoryIdByName[p.name], p.budget, fmtDate(monthDate)]);
        budgetCount++;
      }
    }
    console.log(`✅ ${budgetCount} presupuestos mensuales creados`);

    // 5. Ingresos: sueldo mensual (categoría de sistema "Sueldo") + algún freelance.
    const { rows: incomeCats } = await client.query(
      `SELECT id, name FROM categories WHERE user_id IS NULL AND type = 'income'`,
    );
    const sueldoId = incomeCats.find(c => c.name === 'Sueldo')?.id ?? null;
    const freelanceId = incomeCats.find(c => c.name === 'Freelance')?.id ?? null;

    const otrosId = incomeCats.find(c => c.name === 'Otros Ingresos')?.id ?? sueldoId;
    const propinaId = incomeCats.find(c => c.name === 'Propinas')?.id ?? sueldoId;

    for (let m = MONTHS_OF_HISTORY; m >= 0; m--) {
      const payDate = new Date(today.getFullYear(), today.getMonth() - m, 5, 9, 0);
      if (payDate > today) continue;
      await insertIncome(sueldoId, MONTHLY_INCOME, payDate, 'Sueldo mensual');

      // Freelance ocasional (~1 de cada 3 meses)
      if (freelanceId && rand() < 0.35) {
        const fDay = 8 + Math.floor(rand() * 18);
        const fDate = new Date(today.getFullYear(), today.getMonth() - m, fDay, 15, 0);
        if (fDate <= today) {
          await insertIncome(freelanceId, randAmount(80000, 250000), fDate, 'Proyecto freelance');
        }
      }
    }
    console.log(`✅ ${incomeCount} ingresos generados`);

    // 6. Gastos históricos (desde hace 9 meses hasta el final del mes pasado).
    //    Selección de categoría ponderada por frecuencia (weight).
    const weightedPool: number[] = [];
    expenseProfiles.forEach((p, i) => { for (let k = 0; k < p.weight; k++) weightedPool.push(i); });

    const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let d = new Date(date9MonthsAgo); d < firstDayCurrentMonth; d.setDate(d.getDate() + 1)) {
      // 1 a 2 por día: gasto mensual (~700k) por debajo del sueldo (850k) → balance sano
      const dailyTransactions = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < dailyTransactions; i++) {
        const p = expenseProfiles[pick(weightedPool)];
        const when = new Date(d);
        when.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60));
        await insertExpense(categoryIdByName[p.name], randAmount(p.min, p.max), when, pick(p.descs));
      }
    }

    // 7. MES ACTUAL: el gasto se reparte entre la SEMANA actual (poblada, para que
    //    el filtro "Semana" tenga datos propios) y el resto del mes, llegando a un
    //    nivel de presupuesto variado por categoría (ok / advertencia / sobrepasado).
    const elapsedDays = today.getDate();
    const weekStartDay = Math.max(1, today.getDate() - today.getDay()); // domingo de la semana actual
    const monthAcc: Record<string, number> = {};
    expenseProfiles.forEach(p => { monthAcc[p.name] = 0; });

    // 7a. Semana actual: cada día con varios gastos diarios (montos acotados) + ingresos,
    //     para que la vista "Semana" no quede vacía ni tan negativa.
    for (let day = weekStartDay; day <= elapsedDays; day++) {
      const nTx = 2 + Math.floor(rand() * 3); // 2 a 4 gastos por día
      for (let i = 0; i < nTx; i++) {
        const p = expenseProfiles[pick(weightedPool)];
        const amount = randAmount(p.min, Math.round((p.min + p.max) / 2));
        const when = new Date(today.getFullYear(), today.getMonth(), day,
          Math.floor(rand() * 24), Math.floor(rand() * 60));
        await insertExpense(categoryIdByName[p.name], amount, when, pick(p.descs));
        monthAcc[p.name] += amount;
      }
    }
    // Ingresos dentro de la semana (sin sueldo, para que no sea pura pérdida)
    await insertIncome(propinaId, randAmount(15000, 40000),
      new Date(today.getFullYear(), today.getMonth(), Math.min(elapsedDays, weekStartDay + 1), 13, 0), 'Propina');
    await insertIncome(otrosId, randAmount(60000, 120000),
      new Date(today.getFullYear(), today.getMonth(), Math.min(elapsedDays, weekStartDay + 2), 18, 0), 'Venta de ropa usada');

    // 7b. Resto del mes (días 1..weekStartDay-1): completar cada categoría hasta su ratio.
    const maxDay = Math.max(1, weekStartDay - 1);
    for (const p of expenseProfiles) {
      const target = Math.round(p.budget * p.ratio);
      let acc = monthAcc[p.name];
      let guard = 0;
      while (acc < target && guard < 100) {
        guard++;
        let amount = randAmount(p.min, p.max);
        const remaining = target - acc;
        if (amount > remaining) amount = Math.max(500, Math.round(remaining / 100) * 100);
        const day = 1 + Math.floor(rand() * maxDay);
        const when = new Date(today.getFullYear(), today.getMonth(), day,
          Math.floor(rand() * 24), Math.floor(rand() * 60));
        await insertExpense(categoryIdByName[p.name], amount, when, pick(p.descs));
        acc += amount;
      }
    }
    console.log(`✅ ${expenseCount} gastos generados (${MONTHS_OF_HISTORY} meses + mes actual)`);

    await client.query('COMMIT');
    console.log('🚀 Seed completado exitosamente. La base de datos está lista para la presentación.');

    // Refrescar la vista materializada FUERA de la transacción: si falla
    // (p.ej. la vista no existe en una BD desactualizada) NO debe revertir el
    // seed. Un error dentro de la transacción la aborta y convierte el COMMIT
    // en ROLLBACK. Además es opcional: el dashboard consulta las tablas directo.
    try {
      await client.query(`REFRESH MATERIALIZED VIEW mv_monthly_expense_summary;`);
      console.log('✅ Vista materializada actualizada');
    } catch (e) {
      console.warn('⚠️  No se pudo refrescar mv_monthly_expense_summary (opcional, el dashboard no la usa):', (e as Error).message);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante el seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
