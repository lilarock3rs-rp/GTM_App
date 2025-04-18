// Script simple para verificar la conexión a la base de datos
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function testDatabase() {
  console.log('Testing database connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is missing');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Intenta ejecutar una consulta simple
    const res = await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current database time:', res.rows[0].now);
    
    // Mostrar todas las tablas en la base de datos
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función
testDatabase();