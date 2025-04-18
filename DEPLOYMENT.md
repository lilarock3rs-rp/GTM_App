# Guía de Despliegue en Vercel

## Nueva Estructura Optimizada para Vercel

La aplicación ahora incluye una estructura optimizada para Vercel usando el directorio `/api` con un adaptador específico. Esta configuración evita problemas comunes en despliegues serverless.

## Base de Datos PostgreSQL (Recomendado)

Para un despliegue en producción, se recomienda usar una base de datos PostgreSQL para almacenar las reglas de atribución, registros de webhook y configuración de la aplicación. La aplicación está configurada para usar PostgreSQL de manera automática cuando la variable `DATABASE_URL` está disponible.

### Opciones de Base de Datos Compatible con PostgreSQL

Recomendamos usar alguno de estos proveedores:

1. **Neon Database** (recomendado)
   - Ofrece un plan gratuito generoso
   - Excelente integración con Vercel
   - Serverless-native PostgreSQL
   - Página: [neon.tech](https://neon.tech)

2. **Supabase**
   - Incluye autenticación y almacenamiento de archivos
   - Plan gratuito disponible
   - Página: [supabase.com](https://supabase.com)

3. **Railway**
   - Fácil de usar y configurar
   - Página: [railway.app](https://railway.app)

4. **ElephantSQL**
   - Proveedor establecido de PostgreSQL como servicio
   - Plan gratuito disponible
   - Página: [elephantsql.com](https://www.elephantsql.com)

### Configuración de Base de Datos

1. **Crear una Base de Datos PostgreSQL**
   - Regístrate en uno de los proveedores mencionados
   - Crea una nueva base de datos PostgreSQL
   - Obtén la URL de conexión (DATABASE_URL)

2. **Inicialización de la Base de Datos**
   - La aplicación creará automáticamente las tablas necesarias
   - Para inicializar datos de muestra, puedes ejecutar el script de seed:
     ```
     npm run db:push
     npm run db:seed
     ```

## Pasos para Desplegar en Vercel

1. **Clonar el repositorio en GitHub**
2. **Conectar a Vercel**
   - Inicia sesión en [Vercel](https://vercel.com)
   - Haz clic en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Haz clic en "Import"

3. **Configurar el Proyecto**
   - Framework Preset: selecciona "Other"
   - Root Directory: deja en `.` (raíz del proyecto)
   - Build Command: dejarlo en blanco (se configura en vercel.json)
   - Output Directory: dejarlo en blanco (se configura en vercel.json)

4. **Configurar Variables de Entorno**
   - **IMPORTANTE**: Añade la variable `HUBSPOT_API_KEY` con tu clave de API de HubSpot
   - Añade la variable `VERCEL` con valor `1` para indicar que estamos en entorno Vercel
   - Añade la variable `DATABASE_URL` con la URL de conexión a tu base de datos PostgreSQL
     (La aplicación detectará automáticamente esta variable y usará almacenamiento en base de datos)
   - Puedes usar el script `generate-env.js` para generar un archivo `.env.local`:
     ```
     node generate-env.js HUBSPOT_API_KEY=tu_clave_api DATABASE_URL=tu_url_de_postgresql
     ```
   - Luego puedes subir este archivo durante el despliegue en Vercel

5. **Desplegar**
   - Haz clic en "Deploy"
   - Espera a que el proceso de despliegue termine

6. **Verificar el Despliegue**
   - Una vez completado el despliegue, prueba estas URLs para verificar:
     - `https://tu-dominio.vercel.app/api` - Respuesta básica del API
     - `https://tu-dominio.vercel.app/test` - Endpoint simplificado con información detallada
     - `https://tu-dominio.vercel.app/api/test` - Misma respuesta que el anterior
     - `https://tu-dominio.vercel.app/api/hubspot` - Verificación de la configuración de HubSpot
   - **IMPORTANTE**: Si sigues recibiendo el error `FUNCTION_INVOCATION_FAILED`, prueba estas soluciones:
     1. Usa SOLAMENTE las rutas simplificadas (/api, /test, /api/test, /api/hubspot) que hemos creado específicamente para entornos serverless
     2. Espera 1-2 minutos después del despliegue antes de probar (a veces Vercel necesita tiempo para inicializar completamente)

## Solución de Problemas Comunes

Si encuentras problemas al desplegar en Vercel, aquí hay algunas soluciones potenciales:

### 1. Verificar la Variable de Entorno HUBSPOT_API_KEY

La aplicación requiere la clave API de HubSpot para funcionar correctamente. Asegúrate de que has configurado la variable de entorno `HUBSPOT_API_KEY` en el panel de control de Vercel.

1. Ve a la configuración de tu proyecto en Vercel
2. Navega a la sección "Environment Variables"
3. Añade la variable `HUBSPOT_API_KEY` con tu clave de API de HubSpot

### 2. Problemas con la Base de Datos

Si la aplicación tiene problemas para conectarse a la base de datos, verifica lo siguiente:

1. **Verifica la URL de conexión**: Asegúrate de que la variable `DATABASE_URL` esté correctamente configurada en Vercel.
   - El formato debe ser: `postgresql://usuario:contraseña@host:puerto/nombre_base_datos`

2. **Comprueba si la base de datos está accesible**:
   - Verifica que el proveedor de base de datos esté activo y funcionando
   - Asegúrate de que la base de datos permita conexiones desde Vercel (algunos proveedores requieren configurar reglas de IP)

3. **Inicialización de la base de datos**:
   - Si es una nueva base de datos, se crearán automáticamente las tablas necesarias cuando el servidor se inicie.
   - Si no ves datos en la aplicación, intenta ejecutar manualmente el script de seeding:
     ```
     # Para desarrollo local
     npm run db:push
     npm run db:seed
     ```

4. **Verifica los logs**:
   - Los errores de conexión a la base de datos aparecerán en los logs de Vercel
   - Puedes encontrar mensajes específicos sobre el estado de la conexión a la base de datos

### 3. Error de Módulos ES

Si encuentras errores como `module is not defined in ES module scope` en los archivos del directorio `/api`, esto se debe a una incompatibilidad entre el tipo de módulo configurado en package.json y la sintaxis utilizada en los archivos:

1. **Solucionando problemas de módulos**:
   - Verifica que todos los archivos `.js` en el directorio `/api` estén usando la sintaxis ES Module correcta
   - Los archivos deben usar `export default function handler(req, res) {...}` en lugar de `module.exports = (req, res) => {...}`
   - Si prefieres mantener la sintaxis CommonJS, cambia la extensión de los archivos a `.cjs`

2. **Ejemplo de sintaxis ES Module correcta**:
   ```javascript
   // Formato ESM correcto
   export default function handler(req, res) {
     res.json({
       message: 'API de HubSpot Attribution funcionando',
       time: new Date().toISOString(),
       url: req.url
     });
   }
   ```

3. **Importaciones en ES Module**:
   - Usa `import axios from 'axios';` en lugar de `const axios = require('axios');`
   - Para importaciones de ruta, usa `import { func } from './path.js';` (incluye la extensión)

### 4. Error FUNCTION_INVOCATION_FAILED

Si encuentras este error específico, prueba estas soluciones:

1. **Incrementa el Tiempo de Ejecución de la Función**:
   - En el panel de control de Vercel, ve a "Settings" > "Functions"
   - Incrementa el "Max Duration" a 60 segundos o más según sea necesario
   - (Nota: Esto ya está configurado en el archivo vercel.json)

2. **Verifica los Logs de Vercel**:
   - En el panel de control de Vercel, navega a la pestaña "Deployments"
   - Selecciona el despliegue con error
   - Haz clic en "Functions" y busca logs de error detallados

3. **Prueba con un Nuevo Despliegue**:
   - A veces, simplemente hacer un nuevo despliegue puede resolver el problema
   - Realiza un pequeño cambio en tu código (como agregar un comentario)
   - Sube el cambio a tu repositorio
   - Vercel automáticamente iniciará un nuevo despliegue

## Configuración del Webhook de HubSpot

Después de desplegar exitosamente tu aplicación, debes configurar el webhook en HubSpot:

1. En HubSpot, navega a Settings > Integrations > API Key
2. Crea una nueva clave API si aún no tienes una
3. Luego ve a Settings > Integrations > Webhooks
4. Crea un nuevo webhook con las siguientes configuraciones:
   - URL del webhook: `https://tu-app.vercel.app/api/webhook`
   - Eventos de suscripción: "Contact lifecycle stage change"
   - Método: POST

## Prueba del Webhook

Para probar que tu webhook está funcionando correctamente:

1. En HubSpot, encuentra un contacto de prueba
2. Cambia la etapa del ciclo de vida del contacto
3. Verifica los logs en Vercel para confirmar que el webhook se activó
4. Revisa la sección "Webhook Logs" en tu aplicación para ver la actividad

## Mantenimiento

Recuerda que cada vez que hagas cambios en tu código y los subas a tu repositorio, Vercel automáticamente desplegará la nueva versión. Asegúrate de probar cualquier cambio importante en un entorno de desarrollo antes de subirlos.

### Actualización y Mantenimiento de la Base de Datos

Si necesitas hacer cambios en el esquema de la base de datos o en los datos iniciales:

1. **Modificaciones en el esquema**:
   - Actualiza los modelos en `shared/schema.ts`
   - Ejecuta `npm run db:push` para aplicar los cambios sin perder datos existentes
   - Para un reset completo (elimina todos los datos), usa `npm run db:migrate:reset`

2. **Actualización de datos de muestra**:
   - Modifica el script de seed en `scripts/seed-db.js`
   - Ejecuta `npm run db:seed` para agregar nuevos datos de muestra

3. **Respaldo de datos**:
   - La mayoría de proveedores de PostgreSQL ofrecen respaldos automáticos
   - Es recomendable configurar respaldos periódicos para prevenir pérdida de datos
   - Para respaldos manuales, puedes usar `pg_dump`:
     ```
     pg_dump -U usuario -h host -p puerto -d nombre_base_datos > respaldo.sql
     ```

4. **Monitoreo de rendimiento**:
   - Si la aplicación comienza a responder lentamente, verifica el rendimiento de la base de datos
   - Considera agregar índices a columnas frecuentemente consultadas
   - Optimiza consultas complejas si es necesario

## Problemas Comunes con la Interfaz Web

Si al acceder a la URL principal (`/`) ves código JavaScript en bruto en lugar de la interfaz gráfica, esto indica que la parte frontend no está siendo servida correctamente por Vercel. Hemos implementado una solución para este problema:

### Solución Implementada

1. **Servidor estático dedicado**: 
   - Hemos creado un archivo específico `api/static.js` que funciona como un servidor estático para los archivos frontend.
   - Este archivo sirve los archivos compilados desde el directorio `dist/`.

2. **Configuración de rutas en vercel.json**:
   - Rutas específicas para assets, archivos estáticos y páginas de la aplicación.
   - Una ruta catch-all que redirige a `api/static.js` para manejar la navegación SPA.

3. **Webhook independiente**:
   - Un archivo `api/webhook.js` para manejar específicamente los webhooks de HubSpot.

Esta solución permite que tanto la API como la interfaz funcionen en Vercel.

## Soluciones Alternativas

Si continúas teniendo problemas, considera estas opciones adicionales:

1. **Migrar a la arquitectura serverless**: Desarrolla la aplicación completa como funciones individuales en el directorio `/api` siguiendo el patrón de los endpoints que ya creamos.

2. **Usar Next.js**: Considera migrar el proyecto a Next.js, que tiene mejor integración con Vercel y maneja automáticamente muchos aspectos del despliegue serverless.

3. **Desplegar en otro proveedor**: Si necesitas la estructura actual de la aplicación, considera desplegar en:
   - Render.com - Soporta aplicaciones Express completas
   - Railway.app - Buen soporte para aplicaciones Node.js
   - Heroku - Plataforma establecida para aplicaciones Node.js
   - Google Cloud Run - Opción serverless que soporta contenedores completos

4. **Solución híbrida**: Usa Vercel para las rutas de API simplificadas (/api/webhook, etc.) y despliega la interfaz en Netlify u otro proveedor de hosting estático.