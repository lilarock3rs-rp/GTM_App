// Script para popular la base de datos con datos iniciales
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is missing');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Verificar si ya existen reglas
    const rulesResult = await pool.query('SELECT COUNT(*) FROM attribution_rules');
    const rulesCount = parseInt(rulesResult.rows[0].count, 10);
    
    if (rulesCount > 0) {
      console.log(`La tabla attribution_rules ya tiene ${rulesCount} registros. Omitiendo...`);
    } else {
      console.log('Insertando reglas de atribución...');
      
      // Reglas de atribución por defecto
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
          hs_latest_source_data_2: null,
          gtm_summary: "Outbound | Email | Newsletter",
          gtm_motion: "Outbound",
          gtm_medium: "Email",
          gtm_web_source: "Newsletter",
          gtm_term: "Email Campaign"
        },
        {
          latest_traffic_source: "Direct",
          hs_latest_source_data_2: null,
          gtm_summary: "Direct | None | None",
          gtm_motion: "Direct",
          gtm_medium: "None",
          gtm_web_source: "None",
          gtm_term: "Direct Traffic"
        },
        {
          latest_traffic_source: "Referral",
          hs_latest_source_data_2: null,
          gtm_summary: "Inbound | Referral | Website",
          gtm_motion: "Inbound",
          gtm_medium: "Referral",
          gtm_web_source: "Website",
          gtm_term: "Source Drill-Down 2"
        }
      ];
      
      // Insertar cada regla
      for (const rule of defaultRules) {
        await pool.query(
          `INSERT INTO attribution_rules 
          (latest_traffic_source, hs_latest_source_data_2, gtm_summary, gtm_motion, gtm_medium, gtm_web_source, gtm_term) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            rule.latest_traffic_source,
            rule.hs_latest_source_data_2,
            rule.gtm_summary,
            rule.gtm_motion,
            rule.gtm_medium,
            rule.gtm_web_source,
            rule.gtm_term
          ]
        );
      }
      
      console.log(`${defaultRules.length} reglas de atribución insertadas.`);
    }
    
    // Verificar si ya existen configuraciones
    const settingsResult = await pool.query('SELECT COUNT(*) FROM settings');
    const settingsCount = parseInt(settingsResult.rows[0].count, 10);
    
    if (settingsCount > 0) {
      console.log(`La tabla settings ya tiene ${settingsCount} registros. Omitiendo...`);
    } else {
      console.log('Insertando configuración predeterminada...');
      
      // Configuración predeterminada
      await pool.query(
        `INSERT INTO settings 
        (hubspot_api_key, webhook_url, webhook_secret, webhook_status) 
        VALUES ($1, $2, $3, $4)`,
        [
          process.env.HUBSPOT_API_KEY || '',
          'https://your-app-url/api/webhook',
          '',
          'inactive'
        ]
      );
      
      console.log('Configuración predeterminada insertada.');
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar la función de poblamiento
seedDatabase();