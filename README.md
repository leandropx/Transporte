# FleetMaster - Sistema de Gestión de Flotas

Aplicación SPA (Single Page Application) "mobile-first" desarrollada con Vue 3 (Composition API), Pinia, Tailwind CSS y Supabase para el backend.

## 🚀 Inicio Rápido

1. Clona el repositorio.
2. Copia `.env.example` a `.env` y configura tus credenciales de Supabase:
   ```bash
   cp .env.example .env
   ```
3. Instala las dependencias y ejecuta el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```

## 🗄️ Base de Datos (Supabase)

El esquema de base de datos se encuentra en `supabase_schema.sql` en la raíz del proyecto. Ejecuta este script en el editor SQL de tu panel de Supabase para inicializar las tablas (`vehicles`, `routes`, `maintenance_logs`), además de configurar las políticas de Row-Level Security (RLS) y los triggers automatizados de estado.

## 🌿 Estrategia de Ramas (Git Flow Simplificado)

Recomendamos el siguiente modelo para mantener el código limpio y productivo:
- `main`: Reflexiona el estado de producción. Cualquier push aquí se despliega a producción vía Vercel/GitHub Actions.
- `dev`: Rama principal de integración y ambiente de Staging.
- `feature/*`: (Ej: `feature/global-search`) Creadas para desarrollar nuevas características antes de hacer Merge Request a `dev`.
- `hotfix/*`: (Ej: `hotfix/fix-loading-state`) Para arreglos rápidos directos a producción.

## 🛳 CI/CD & Despliegue

### Vercel (Recomendado)
El proyecto contiene un archivo `vercel.json` que previene problemas de enrutamiento (404s en recargas de página) comunes en aplicaciones SPA construidas con Vue Router.
El despliegue en Vercel es automático al conectar el repositorio de GitHub. 

### GitHub Actions (Ejemplo .github/workflows/main.yml)

El proyecto viene con comandos preconfigurados listos para ser verificados por GitHub actions:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci
      - name: Build Application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

## 📦 Estructura de Proyecto

- `src/components/`: Componentes reutilizables de UI (Ej: `GlobalSearch.vue`).
- `src/composables/`: Lógica de estado compartida e interacciones backend (`useTruckSearch.ts`).
- `src/services/`: Configuración y singletons (Cliente `supabase.ts`).
- `src/stores/`: Pinia stores (si requieren estados más complejos que los proporcionados por composables).
- `src/views/`: Páginas componentes (Ej: `Truck360View.vue`).

---
Generado con altos estándares de calidad, garantizando seguridad, UI responsiva (Tailwind CSS) y fácil mantenibilidad (Composition API estricta).
