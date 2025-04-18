// Script para inicializar la base de datos con datos de ejemplo

import { db } from '../server/db.js';
import * as schema from '../shared/schema.js';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Verificar si ya existen registros para evitar duplicados
    const existingRules = await db.select().from(schema.attributionRules);
    
    if (existingRules.length > 0) {
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
      
      // Insertar todas las reglas en batch
      await db.insert(schema.attributionRules).values(defaultRules);
      console.log(`${defaultRules.length} attribution rules seeded.`);
    }
    
    // Verificar si ya existen configuraciones
    const existingSettings = await db.select().from(schema.settings);
    
    if (existingSettings.length > 0) {
      console.log('Settings already exist. Skipping seed.');
    } else {
      console.log('Seeding settings...');
      // Configuración por defecto
      await db.insert(schema.settings).values({
        hubspot_api_key: process.env.HUBSPOT_API_KEY || '',
        webhook_url: 'https://your-app-url/api/webhook',
        webhook_secret: '',
        webhook_status: 'inactive'
      });
      console.log('Settings seeded.');
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    // Cerrar la conexión
    try {
      await db.end();
    } catch (e) {
      // Ignorar error al cerrar
    }
  }
}

// Ejecutar la función
seedDatabase();