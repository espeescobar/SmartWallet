import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';


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

async function runSeed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Iniciando el seed de la base de datos...');

    // Limpiamos al usuario para evitar duplicados
    await client.query(`DELETE FROM users WHERE email = 'cata.rojas@gmail.com'`);

    // Fechas históricas base
    const date9MonthsAgo = new Date();
    date9MonthsAgo.setMonth(date9MonthsAgo.getMonth() - 9);

    const date4MonthsAgo = new Date();
    date4MonthsAgo.setMonth(date4MonthsAgo.getMonth() - 4);

    // 1. Encriptar la contraseña de Cata
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Meev2003', saltRounds);

    // Crear el Usuario 'Cata' con la contraseña ya ENCRIPTADA
    const userRes = await client.query(`
      INSERT INTO users (full_name, email, password_hash, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `, ['Cata', 'catarojas@gmail.com', hashedPassword, date9MonthsAgo]);
    
    const userId = userRes.rows[0].id;
    console.log(`✅ Usuario Cata creado con ID: ${userId} (Contraseña encriptada)`);

    // 2. Crear 4 Categorías de Gastos
    const categories = [
      { name: 'Alimentación', icon: '🛒', color: '#D9EBFF' },
      { name: 'Mascotas', icon: '🐶', color: '#005AD6' },
      { name: 'Salud y Deporte', icon: '🚲', color: '#1A1A1A' },
      { name: 'Transporte', icon: '🚗', color: '#6E6E73' }
    ];
    
    const categoryIds = [];
    for (const cat of categories) {
      const catRes = await client.query(`
        INSERT INTO categories (user_id, name, type, icon, color, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `, [userId, cat.name, 'expense', cat.icon, cat.color, date9MonthsAgo]);
      categoryIds.push(catRes.rows[0].id);
    }
    console.log('✅ 4 Categorías creadas');

    // 3. Crear 2 Objetivos de Ahorro
    const goals = [
      { title: 'Fondo de Emergencia Anual', target_amount: 1200000, current_amount: 450000, deadline: new Date('2026-12-31'), icon: '🎯', createdAt: date9MonthsAgo },
      { title: 'Vacaciones de Verano', target_amount: 800000, current_amount: 300000, deadline: new Date('2027-01-15'), icon: '✈️', createdAt: date4MonthsAgo }
    ];

    for (const goal of goals) {
      await client.query(`
        INSERT INTO goals (user_id, title, target_amount, current_amount, deadline, icon, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
      `, [userId, goal.title, goal.target_amount, goal.current_amount, goal.deadline, goal.icon, goal.createdAt, goal.createdAt]);
    }
    console.log('✅ 2 Objetivos de ahorro creados');

    // 4. Generar datos históricos de gastos
    const currentDate = new Date();
    const startDate = new Date();
    startDate.setMonth(currentDate.getMonth() - 9);

    let transactionsCount = 0;

    for (let d = new Date(startDate); d <= currentDate; d.setDate(d.getDate() + 1)) {
      const dailyTransactions = Math.floor(Math.random() * 4); 
      
      for (let i = 0; i < dailyTransactions; i++) {
        const randomCategory = categoryIds[Math.floor(Math.random() * categoryIds.length)];
        const randomAmount = Math.floor(Math.random() * (45000 - 2500 + 1)) + 2500; 
        
        const historicalDate = new Date(d);
        historicalDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const formattedDate = historicalDate.toISOString().split('T')[0]; 
        
        await client.query(`
          INSERT INTO transactions (user_id, category_id, amount, transaction_date, description, type, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `, [
          userId, 
          randomCategory, 
          randomAmount, 
          formattedDate, 
          null, 
          'expense',
          historicalDate, 
          historicalDate
        ]);
        
        transactionsCount++;
      }
    }
    console.log(`✅ ${transactionsCount} transacciones generadas en los últimos 9 meses`);

    try {
      await client.query(`REFRESH MATERIALIZED VIEW mv_monthly_expense_summary;`);
    } catch (e) {}

    await client.query('COMMIT');
    console.log('🚀 Seed completado exitosamente. La base de datos está lista para la presentación.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante el seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();