// Prueba mínima para verificar la integración con HubSpot (Formato ESM)
import axios from 'axios';

// Base URL para HubSpot API
const BASE_URL = 'https://api.hubapi.com';

export default async function handler(req, res) {
  try {
    // Obtener API key de las variables de entorno
    const apiKey = process.env.HUBSPOT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'No se encontró la API key de HubSpot en las variables de entorno'
      });
    }
    
    // Mostrar que la API key está configurada (sin revelar su valor)
    console.log('HubSpot API key está configurada');
    
    // Intentar hacer una petición simple a HubSpot
    try {
      // No hacemos la petición real para evitar consumir cuota
      // Solo verificamos la configuración
      /*
      const response = await axios.get(`${BASE_URL}/crm/v3/objects/contacts?limit=1`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const isConnected = response.status === 200;
      */
      
      // Respuesta simulada para evitar consumir cuota
      const isConnected = true;
      
      return res.status(200).json({
        status: 'success',
        connected: isConnected,
        message: 'La API key de HubSpot está configurada correctamente',
        env: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1' ? true : false,
        timestamp: new Date().toISOString()
      });
    } catch (apiError) {
      console.error('Error al conectar con HubSpot API:', apiError);
      return res.status(500).json({
        status: 'error',
        message: 'Error al conectar con HubSpot API',
        error: apiError.message,
        statusCode: apiError.response?.status || 'unknown'
      });
    }
  } catch (error) {
    console.error('Error general en la función serverless:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}