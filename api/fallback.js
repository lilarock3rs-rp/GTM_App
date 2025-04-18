// Página de respaldo para mostrar en caso de que falle la carga del frontend
export default function handler(req, res) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HubSpot GTM Attribution</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background: linear-gradient(to right, #f8f9fa, #e9ecef);
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      color: #333;
    }
    header {
      background: linear-gradient(135deg, #7928CA, #FF0080);
      color: white;
      padding: 1.5rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    main {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.05);
      flex: 1;
    }
    h1 {
      margin: 0;
      font-size: 1.8rem;
    }
    h2 {
      color: #7928CA;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 0.5rem;
    }
    .card {
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      background: #fafafa;
    }
    .card h3 {
      margin-top: 0;
      color: #555;
    }
    footer {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      color: #666;
      font-size: 0.9rem;
    }
    .api-status {
      display: flex;
      align-items: center;
      margin-top: 1rem;
    }
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 0.5rem;
    }
    .status-loading {
      background-color: #ffc107;
    }
    .status-ok {
      background-color: #28a745;
    }
    .status-error {
      background-color: #dc3545;
    }
    button {
      background: linear-gradient(135deg, #7928CA, #FF0080);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 1rem;
    }
    button:hover {
      opacity: 0.9;
    }
    .links {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .links a {
      text-decoration: none;
      color: #7928CA;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <header>
    <h1>HubSpot GTM Attribution</h1>
  </header>
  
  <main>
    <div class="card">
      <h3>Estado de la Aplicación</h3>
      <p>La aplicación está en proceso de inicialización. Esto puede deberse a alguna de las siguientes razones:</p>
      <ul>
        <li>El despliegue en Vercel está en proceso o recién finalizado</li>
        <li>La configuración de rutas necesita ser actualizada</li>
        <li>El proceso de construcción (build) no ha generado correctamente los archivos</li>
      </ul>
      
      <div class="api-status">
        <div class="status-indicator status-loading" id="api-indicator"></div>
        <span id="api-status-text">Verificando estado de la API...</span>
      </div>
      
      <button onclick="checkApiStatus()">Verificar estado</button>
    </div>
    
    <h2>Endpoints disponibles</h2>
    <div class="card">
      <h3>API Endpoints</h3>
      <p>Mientras se carga la interfaz principal, puedes verificar que los siguientes endpoints estén funcionando:</p>
      <div class="links">
        <a href="/api" target="_blank">/api</a>
        <a href="/api/test" target="_blank">/api/test</a>
        <a href="/api/hubspot" target="_blank">/api/hubspot</a>
      </div>
    </div>
  </main>
  
  <footer>
    <p>HubSpot GTM Attribution - Versión 1.0.0</p>
  </footer>
  
  <script>
    function checkApiStatus() {
      const indicator = document.getElementById('api-indicator');
      const statusText = document.getElementById('api-status-text');
      
      indicator.className = 'status-indicator status-loading';
      statusText.textContent = 'Verificando estado de la API...';
      
      fetch('/api')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Error al conectar con la API');
        })
        .then(data => {
          indicator.className = 'status-indicator status-ok';
          statusText.textContent = 'API funcionando correctamente. Tiempo: ' + data.time;
          
          // Intentar cargar la página principal
          window.location.href = '/';
        })
        .catch(error => {
          indicator.className = 'status-indicator status-error';
          statusText.textContent = 'Error: ' + error.message;
        });
    }
    
    // Verificar automáticamente al cargar
    window.onload = function() {
      setTimeout(checkApiStatus, 1000);
    };
  </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}