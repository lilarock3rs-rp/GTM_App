// Scripts para inicializar y actualizar la base de datos
const { execSync } = require('child_process');

// Ejecutar comandos de migración de Drizzle
try {
  console.log('Pushing database schema...');
  execSync('npx drizzle-kit push:pg', { stdio: 'inherit' });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error);
  process.exit(1);
}