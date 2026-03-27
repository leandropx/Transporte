/**
 * Utilidades de formateo centralizadas.
 * Única fuente de verdad para formateo de patentes, fechas, moneda y RUT.
 */

// ──────────────────────────────────────────────
// Patentes (Chilean License Plates)
// ──────────────────────────────────────────────

/**
 * Limpia una patente de cualquier separador o espacio.
 * @returns Patente en mayúsculas sin separadores (ej: "AB1234")
 */
export const cleanLicensePlate = (plate: string): string => {
  return plate.toUpperCase().replace(/[\s\-·.]/g, '')
}

/**
 * Formatea una patente al estilo visual XX·XX·XX.
 * @returns Patente formateada (ej: "AB·12·34")
 */
export const formatLicensePlate = (plate: string): string => {
  const clean = cleanLicensePlate(plate)
  if (clean.length !== 6) return plate
  return `${clean.substring(0, 2)}·${clean.substring(2, 4)}·${clean.substring(4)}`
}

/**
 * Valida que una patente tenga 6 caracteres alfanuméricos.
 */
export const isValidLicensePlate = (plate: string): boolean => {
  const clean = cleanLicensePlate(plate)
  return clean.length === 6 && /^[A-Z0-9]{6}$/.test(clean)
}

// ──────────────────────────────────────────────
// RUT (Chilean National ID)
// ──────────────────────────────────────────────

/** Limpia un RUT dejando solo dígitos y K */
export const cleanRut = (value: string): string => {
  return value.replace(/[^0-9kK]/g, '').toUpperCase()
}

/** Formatea un RUT con puntos y guión (ej: "12.345.678-9") */
export const formatRut = (rut: string): string => {
  if (!rut) return ''
  const value = cleanRut(rut)
  if (value.length <= 1) return value

  const dv = value.slice(-1)
  let numberString = value.slice(0, -1)
  numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${numberString}-${dv}`
}

/** Valida un RUT chileno con dígito verificador */
export const isValidRut = (rutStr: string): boolean => {
  if (!/^[0-9.]+-[0-9kK]{1}$/.test(rutStr)) return false
  const clean = cleanRut(rutStr)
  let t = parseInt(clean.slice(0, -1), 10)
  let m = 0, s = 1
  while (t > 0) {
    s = (s + t % 10 * (9 - m++ % 6)) % 11
    t = Math.floor(t / 10)
  }
  const v = (s > 0) ? '' + (s - 1) : 'K'
  return v === clean.slice(-1)
}

// ──────────────────────────────────────────────
// Fechas
// ──────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato legible en español chileno.
 * @returns Ej: "27 mar 2026"
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

// ──────────────────────────────────────────────
// Moneda
// ──────────────────────────────────────────────

/** Formatea un número a moneda (ej: "$1.234.567") */
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('es-CL')}`
}

// ──────────────────────────────────────────────
// Errores
// ──────────────────────────────────────────────

/** Extrae el mensaje de error de un valor unknown */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message)
  }
  return 'Error desconocido'
}
