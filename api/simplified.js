// Versión simplificada para Vercel (Formato ESM)
export default function handler(req, res) {
  try {
    // Respuesta simple para verificar que la función serverless básica está funcionando
    res.status(200).json({
      status: 'OK',
      message: 'La función serverless simplificada está funcionando',
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL === '1' ? true : false,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Captura de cualquier error
    console.error('Error en la función simplificada:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Ocurrió un error al procesar la solicitud',
      errorMessage: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}