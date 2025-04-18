// Script para inicializar la base de datos con datos de ejemplo
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

// Configuración de WebSocket para Neon Database
neonConfig.webSocketConstructor = ws;

// Esquema simple para las tablas
const TABLES = {
  attribution_rules: 'attribution_rules',
  settings: 'settings',
};

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is missing');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    // Verificar si ya existen reglas para evitar duplicados
    const existingRules = await db.execute(`SELECT COUNT(*) FROM ${TABLES.attribution_rules}`);
    const ruleCount = parseInt(existingRules.rows[0].count, 10);
    
    if (ruleCount > 0) {
      console.log('Attribution rules already exist. Skipping seed.');
    } else {
      console.log('Seeding attribution rules...');
      
      // Datos de ejemplo para reglas de atribución
      const defaultRules = [
        {
          latest_traffic_source: "Organic Search",
          hs_latest_source_data_2: "Google",
          gtm_summary: "Inbound | Search | Google",
          gtm_motion: "Inbound",
          gtm_medium: "Search",
          gtm_web_source: "Google",
          gtm_term: "Source Drill-Down 2"
        },
        {
          latest_traffic_source: "Organic Search",
          hs_latest_source_data_2: "Bing",
          gtm_summary: "Inbound | Search | Bing",
          gtm_motion: "Inbound",
          gtm_medium: "Search",
          gtm_web_source: "Bing",
          gtm_term: "Source Drill-Down 2"
        },
        {
          latest_traffic_source: "Paid Search",
          hs_latest_source_data_2: "Google",
          gtm_summary: "Outbound | Search | Google",
          gtm_motion: "Outbound",
          gtm_medium: "Search",
          gtm_web_source: "Google",
          gtm_term: "Source Drill-Down 2"
        },
        {
          latest_traffic_source: "Social Media",
          hs_latest_source_data_2: "LinkedIn",
          gtm_summary: "Inbound | Social | LinkedIn",
          gtm_motion: "Inbound",
          gtm_medium: "Social",
          gtm_web_source: "LinkedIn",
          gtm_term: "Source Drill-Down 2"
        },
        {
          latest_traffic_source: "Social Media",
          hs_latest_source_data_2: "Twitter",
          gtm_summary: "Inbound | Social | Twitter",
          gtm_motion: "Inbound",
          gtm_medium: "Social",
          gtm_web_source: "Twitter",
          gtm_term: "Source Drill-Down 2"
        },
        {
          latest_traffic_source: "Email Marketing",
          gtm_summary: "Outbound | Email | Newsletter",
          gtm_motion: "Outbound",
          gtm_medium: "Email",
          gtm_web_source: "Newsletter",
          gtm_term: "Email Campaign"
        },
        {
          latest_traffic_source: "Direct",
          gtm_summary: "Direct | None | None",
          gtm_motion: "Direct",
          gtm_medium: "None",
          gtm_web_source: "None",
          gtm_term: "Direct Traffic"
        },
        {
          latest_traffic_source: "Referral",
          gtm_summary: "Inbound | Referral | Website",
          gtm_motion: "Inbound",
          gtm_medium: "Referral",
          gtm_web_source: "Website",
          gtm_term: "Source Drill-Down 2"
        }
      ];
      
      // Insertar cada regla de forma individual
      for (const rule of defaultRules) {
        const now = new Date().toISOString();
        await db.execute(`
          INSERT INTO ${TABLES.attribution_rules} 
          (latest_traffic_source, hs_latest_source_data_2, gtm_summary, gtm_motion, gtm_medium, gtm_web_source, gtm_term, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          rule.latest_traffic_source,
          rule.hs_latest_source_data_2 || null,
          rule.gtm_summary,
          rule.gtm_motion,
          rule.gtm_medium,
          rule.gtm_web_source,
          rule.gtm_term,
          now,
          now
        ]);
      }
      
      console.log(`${defaultRules.length} attribution rules seeded.`);
    }
    
    // Verificar si ya existen configuraciones
    const existingSettings = await db.execute(`SELECT COUNT(*) FROM ${TABLES.settings}`);
    const settingsCount = parseInt(existingSettings.rows[0].count, 10);
    
    if (settingsCount > 0) {
      console.log('Settings already exist. Skipping seed.');
    } else {
      console.log('Seeding settings...');
      // Configuración por defecto
      const now = new Date().toISOString();
      await db.execute(`
        INSERT INTO ${TABLES.settings}
        (hubspot_api_key, webhook_url, webhook_secret, webhook_status, updated_at)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        process.env.HUBSPOT_API_KEY || '',
        'https://your-app-url/api/webhook',
        '',
        'inactive',
        now
      ]);
      
      console.log('Settings seeded.');
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar la función
seedDatabase();