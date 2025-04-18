// Manejador de webhook de HubSpot para Vercel
import express from 'express';
import { storage } from '../server/storage';
import { AttributionService } from '../server/services/attributionService';

// Crear instancia de express
const app = express();
app.use(express.json());

// Crear servicio
const attributionService = new AttributionService(storage);

// Inicializar cliente HubSpot
const initHubSpot = async () => {
  try {
    const settings = await storage.getSettings();
    if (settings && settings.hubspot_api_key) {
      attributionService.initializeHubSpotClient(settings.hubspot_api_key);
      console.log('HubSpot client initialized from settings');
      return true;
    } else if (process.env.HUBSPOT_API_KEY) {
      attributionService.initializeHubSpotClient(process.env.HUBSPOT_API_KEY);
      console.log('HubSpot client initialized from environment');
      return true;
    } else {
      console.log('No HubSpot API key found');
      return false;
    }
  } catch (error) {
    console.error('Error initializing HubSpot client:', error);
    return false;
  }
};

// Ruta de webhook
app.post('/api/webhook', async (req, res) => {
  try {
    console.log('Webhook recibido:', JSON.stringify(req.body));
    
    // Verificar si tenemos los datos necesarios
    if (!req.body.objectId) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required field: objectId'
      });
    }
    
    // Inicializar cliente HubSpot si no está inicializado
    await initHubSpot();
    
    // Procesar el webhook
    const contactId = req.body.objectId;
    const result = await attributionService.processWebhookEvent(contactId);
    
    if (result) {
      return res.status(200).json({
        status: 'success',
        message: 'Webhook processed successfully',
        contactId
      });
    } else {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process webhook',
        contactId
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error processing webhook',
      error: error.message
    });
  }
});

// Handler para Vercel
export default function handler(req, res) {
  if (req.method === 'POST' && req.url === '/api/webhook') {
    return app(req, res);
  }
  
  return res.status(404).json({
    status: 'error',
    message: 'Not found',
    path: req.url
  });
}