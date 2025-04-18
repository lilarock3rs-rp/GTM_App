// Punto de entrada básico para Vercel (Formato ESM)
export default function handler(req, res) {
  // Respuesta simple
  res.json({
    message: 'API de HubSpot Attribution funcionando',
    time: new Date().toISOString(),
    url: req.url
  });
}