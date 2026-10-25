# 7Mares

Marketplace React para venta de barcos, preparado para desplegarse como Web Service en Render y crecer con backend.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Render como Web Service

1. Sube la rama `develop` a GitHub.
2. En Render selecciona **New + > Web Service** e importa el repositorio.
3. Branch: `develop`.
4. Build command: `npm install && npm run build`.
5. Start command: `npm start`.
6. Render usará el puerto asignado mediante `PORT`; `server.js` sirve `dist` y las imágenes locales.

También puedes usar el archivo `render.yaml` como Blueprint. Para futuras APIs, añade rutas `/api` al mismo servidor o separa el backend cuando crezca el proyecto.

## Base de datos

La base recomendada es Supabase: PostgreSQL administrado, API REST automática y plan gratuito suficiente para comenzar. Crea un proyecto en [supabase.com](https://supabase.com), abre **SQL Editor**, ejecuta `supabase/schema.sql` y copia las variables de `.env.example` en Vercel en **Settings > Environment Variables**.

La interfaz incluye datos locales para previsualizarse sin credenciales. Para conectar el catálogo, instala `@supabase/supabase-js`, crea el cliente con esas variables y reemplaza el array `boats` de `src/main.jsx` por una consulta a la tabla `boats`.
