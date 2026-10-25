# 7Mares

Marketplace React para venta de barcos, preparado para Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel selecciona **New Project** e importa el repositorio.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Despliega. `vercel.json` mantiene funcionando las rutas de la SPA.

## Base de datos

La base recomendada es Supabase: PostgreSQL administrado, API REST automática y plan gratuito suficiente para comenzar. Crea un proyecto en [supabase.com](https://supabase.com), abre **SQL Editor**, ejecuta `supabase/schema.sql` y copia las variables de `.env.example` en Vercel en **Settings > Environment Variables**.

La interfaz incluye datos locales para previsualizarse sin credenciales. Para conectar el catálogo, instala `@supabase/supabase-js`, crea el cliente con esas variables y reemplaza el array `boats` de `src/main.jsx` por una consulta a la tabla `boats`.
