// Servir archivos estáticos en Vercel
import { join } from 'path';
import { readFileSync } from 'fs';
import express from 'express';
import { createServer } from 'http';

// Crear la aplicación Express
const app = express();

// Determinar la ruta a la carpeta de distribución
const distPath = join(process.cwd(), 'dist');
const indexPath = join(distPath, 'index.html');

// Configurar middleware para servir archivos estáticos
app.use(express.static(distPath, {
  maxAge: '1d',
  immutable: true,
  index: false
}));

// Ruta catch-all para SPA
app.get('*', (req, res) => {
  try {
    console.log(`[static] Serving index.html for path: ${req.path}`);
    
    // Leer el archivo index.html
    const indexHtml = readFileSync(indexPath, 'utf-8');
    
    // Enviar el archivo como respuesta
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(indexHtml);
  } catch (error) {
    console.error(`[static] Error serving index.html: ${error.message}`);
    res.status(500).send(`
      <html>
        <head><title>Error - Frontend Service</title></head>
        <body>
          <h1>Error serving frontend application</h1>
          <p>The application could not be loaded. Please try again later.</p>
          <p>Technical details: ${error.message}</p>
          <p>Path requested: ${req.path}</p>
        </body>
      </html>
    `);
  }
});

// Exportar el handler para Vercel
export default function handler(req, res) {
  return app(req, res);
}