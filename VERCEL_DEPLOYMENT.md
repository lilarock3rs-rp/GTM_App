# Guía de Despliegue en Vercel

## Solución para problemas de despliegue

Si encuentras problemas durante el despliegue en Vercel, especialmente errores durante el proceso de build, puedes usar este método alternativo:

### Opción 1: Despliegue con vercel.json modificado

1. Ya hemos modificado `vercel.json` para:
   - Evitar el proceso de build complejo
   - Usar un comando simple que copia archivos estáticos
   - Configurar solo las rutas de API necesarias

### Opción 2: Despliegue manual con interfaz simplificada

Si sigues teniendo problemas, puedes:

1. Renombrar `package.vercel.json` a `package.json`
2. Eliminar el directorio `client/`
3. Mantener solo los archivos en `api/` y `public/`
4. Crear un nuevo despliegue en Vercel

### Verificación del despliegue

Una vez desplegado, deberías poder acceder a:

- Interfaz principal: https://your-project.vercel.app/
- API: https://your-project.vercel.app/api
- Webhook: https://your-project.vercel.app/api/webhook

## Notas importantes

- Las funciones de API en `/api/*.js` funcionarán correctamente.
- La interfaz web es una versión estática simplificada con enlaces a los endpoints.
- Esto garantiza que los webhooks y las APIs funcionen correctamente aunque la interfaz completa no esté disponible.

## Solución a largo plazo

Para una solución más completa, considera:

1. Migrar a Next.js para una mejor integración con Vercel
2. Usar una arquitectura serverless completa
3. Separar claramente frontend y backend en diferentes repositorios
