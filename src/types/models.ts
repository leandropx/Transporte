/**
 * Tipos de dominio centralizados.
 * Derivados de Database types pero con overrides semánticos para el frontend.
 * Usar SIEMPRE estos tipos en stores, composables y vistas.
 */
import type { Tables } from './database.types'

// ──────────────────────────────────────────────
// Interfaces auxiliares compartidas
// ──────────────────────────────────────────────

/** Representa un documento adjunto almacenado en Supabase Storage */
export interface AttachedDocument {
  name: string
  url: string
  path: string
}

// ──────────────────────────────────────────────
// Vehículos
// ──────────────────────────────────────────────

export type VehicleStatus = 'disponible' | 'en ruta' | 'en taller' | 'inactivo'

export interface Vehicle extends Omit<Tables<'vehicles'>, 'documents' | 'status'> {
  status: VehicleStatus
  documents: AttachedDocument[] | null
}

// ──────────────────────────────────────────────
// Conductores / Workers
// ──────────────────────────────────────────────

export type WorkerStatus = 'activo' | 'vacaciones' | 'licencia_medica' | 'desvinculado'

export interface Worker extends Omit<Tables<'workers'>, 'documents' | 'status'> {
  status: WorkerStatus
  documents: AttachedDocument[] | null
}

// ──────────────────────────────────────────────
// Rutas
// ──────────────────────────────────────────────

export type RouteStatus = 'planeada' | 'en curso' | 'completada' | 'cancelada'

/** Ref parcial que viene en los JOINs de Supabase */
export interface VehicleRef {
  license_plate: string
  model?: string
}

export interface WorkerRef {
  full_name: string
}

export interface Route extends Omit<Tables<'routes'>, 'status'> {
  status: RouteStatus
  vehicles?: VehicleRef
  workers?: WorkerRef
}

// ──────────────────────────────────────────────
// Mantenciones
// ──────────────────────────────────────────────

export type MaintenanceType = 'preventivo' | 'correctivo'

export interface MaintenanceLog extends Omit<Tables<'maintenance_logs'>, 'type'> {
  type: MaintenanceType
  vehicles?: { license_plate: string }
}
