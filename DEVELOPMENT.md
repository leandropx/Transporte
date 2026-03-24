# Registro de Desarrollo - Sistema de Gestión de Flotas

Este documento rastrea el progreso, la arquitectura y las decisiones técnicas tomadas durante el desarrollo del Sistema de Gestión de Flotas.

## 🏗️ Stack Tecnológico y Arquitectura
- **Frontend**: Vue 3 (Composition API, `<script setup>`), Vite.
- **Enrutamiento y Estado**: Vue Router, Pinia.
- **Estilos**: Tailwind CSS (Mobile-first, diseño limpio y minimalista).
- **Backend / Base de Datos / Autenticación**: Supabase (PostgreSQL, Auth, RLS).
- **Despliegue**: Vercel (Frontend).
- **Control de Versiones**: Git / GitHub.

### Principios de Arquitectura
1. **Modularidad y Reusabilidad**: Componentes de Vue diseñados para un solo propósito (SRP).
2. **Seguridad**: Uso de Row Level Security (RLS) en Supabase para asegurar la lectura/escritura de los datos según el rol del usuario.
3. **Mantenibilidad**: Código tipado fuertemente con TypeScript, evitando `any` y manejando errores de manera predecible.
4. **Respuesta Rápida**: Uso de Lazy Loading en el enrutamiento para mejorar el tiempo de carga inicial de la SPA.

---

## 📅 Bitácora de Desarrollo

### FASE 1: Inicialización y Configuración (Completado)
- [x] Configuración inicial del proyecto con Vue 3, Vite y TypeScript.
- [x] Configuración de Tailwind CSS para el diseño UI.
- [x] Instalación y configuración de Pinia (Gestión de estado global).
- [x] Instalación de Vue Router (Manejo de rutas y lazy loading).
- [x] Integración inicial del cliente de Supabase.
- [x] Diseño preliminar del esquema de base de datos (`supabase_schema.sql`).

### FASE 2: Autenticación y Layout (Completado)
- [x] Implementación del flujo de login / registro con Supabase Auth.
- [x] Diseño y desarrollo del Layout principal (Sidebar, Topbar).
- [x] Protección de rutas mediante Vue Router basado en la sesión de Supabase.

### FASE 3: Módulo de Gestión de Camiones (Completado)
- [x] Vista de listado de camiones con filtrado y búsqueda global (`useTruckSearch.ts` y `GlobalSearch.vue`).
- [x] Formulario de registro y edición de información de cada unidad (placa, marca, modelo, estado, capacidad).
- [x] Integración de los endpoints/consultas de Supabase en stores de Pinia.

### FASE 4: Módulo de Conductores y Viajes (Completado)
- [x] Asignación de conductores a camiones.
- [x] Registro de viajes, orígenes, destinos y actualizaciones de estado en tiempo real.
- [x] Dashboard de estadísticas y resumen general de la flota.

---

## 🛠️ Decisiones Técnicas Registradas

1. **Uso de Supabase sobre Backends Personalizados (Node/Nest)**:
   - *Justificación*: Permite acelerar el go-to-market. Las funciones de Auth, Base de datos y RLS nativo de PostgreSQL integrados agilizan enormemente el proceso sin sacrificar escalabilidad ni seguridad.

2. **Composition API con `<script setup>` estricto**:
   - *Justificación*: Brinda el mejor soporte y type-inference para TypeScript dentro de Vue 3, minimizando el boilerplate y haciendo los componentes más legibles.

3. **Arquitectura de Búsqueda Global (`useTruckSearch.ts`)**:
   - *Justificación*: Extraer la lógica de búsqueda a un composable independiente (en lugar de acoplarla a un componente) permite reusar esta capacidad de filtrado avanzado en cualquier parte de la aplicación, mejorando la coherencia en la UI/UX.

---
*Nota: Este documento se mantendrá actualizado a medida que el proyecto avance y mute a través de las distintas etapas del ciclo de desarrollo.*
