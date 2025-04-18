import type { Request, Response } from 'express';

// Endpoint simple para verificar que Vercel está conectando correctamente
export default function handler(req: Request, res: Response) {
  try {
    res.status(200).json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL === '1' ? true : false,
      timestamp: new Date().toISOString(),
      hubspotApiKey: process.env.HUBSPOT_API_KEY ? 'configured' : 'missing',
      message: 'La aplicación está funcionando correctamente en Vercel'
    });
  } catch (error) {
    console.error('Error en endpoint de status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar el estado de la aplicación',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}