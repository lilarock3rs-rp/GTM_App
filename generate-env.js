/**
 * Script para generar un archivo .env.local para despliegue en Vercel
 * 
 * Uso: node generate-env.js HUBSPOT_API_KEY=tu_clave_api
 * 
 * Esto creará un archivo .env.local que puedes usar directamente en Vercel
 * o subir a un repositorio privado.
 */

const fs = require('fs');

// Variables de entorno mínimas necesarias
const requiredVars = ['HUBSPOT_API_KEY'];

// Variables con valores por defecto
const defaultVars = {
  'VERCEL': '1',
  'NODE_ENV': 'production'
};

// Obtener argumentos de línea de comando
const args = process.argv.slice(2);
const envVars = {};

// Procesar argumentos en formato CLAVE=VALOR
args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key && value) {
    envVars[key] = value;
  }
});

// Verificar variables requeridas
const missingVars = requiredVars.filter(v => !envVars[v]);
if (missingVars.length > 0) {
  console.error(`Error: Faltan variables de entorno requeridas: ${missingVars.join(', ')}`);
  console.error('Uso: node generate-env.js HUBSPOT_API_KEY=tu_clave_api');
  process.exit(1);
}

// Añadir variables por defecto si no están definidas
Object.keys(defaultVars).forEach(key => {
  if (!envVars[key]) {
    envVars[key] = defaultVars[key];
  }
});

// Generar contenido del archivo .env.local
let envContent = '# Variables de entorno para despliegue en Vercel\n';
envContent += '# Generado automáticamente - no editar manualmente\n\n';

Object.keys(envVars).forEach(key => {
  envContent += `${key}=${envVars[key]}\n`;
});

// Guardar archivo
fs.writeFileSync('.env.local', envContent);

console.log('Archivo .env.local generado correctamente con las siguientes variables:');
Object.keys(envVars).forEach(key => {
  // No mostrar valores de claves API por seguridad
  const value = key.includes('KEY') || key.includes('SECRET') 
    ? '*'.repeat(8) 
    : envVars[key];
  console.log(`  ${key}=${value}`);
});
console.log('\nPuedes importar este archivo directamente en Vercel durante el despliegue.');