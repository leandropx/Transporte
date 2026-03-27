/**
 * Composable para buscar un camión por patente con sus rutas y mantenciones.
 * Usa la misma lógica de formateo centralizada.
 */
import { ref } from 'vue'
import { supabase } from '@/services/supabase'
import { formatLicensePlate, getErrorMessage } from '@/utils/formatters'

export interface TruckRoute {
  id: string
  origin: string
  destination: string
  status: string
  start_date: string | null
  end_date: string | null
}

export interface TruckMaintenanceLog {
  id: string
  type: string
  description: string
  replaced_parts: string[]
  cost: number
  maintenance_date: string
}

export interface TruckFull {
  id: string
  license_plate: string
  model: string
  brand: string | null
  year_model: number | null
  mileage: number | null
  capacity: number
  status: string
  routes?: TruckRoute[]
  maintenance_logs?: TruckMaintenanceLog[]
}

export function useTruckSearch() {
  const truck = ref<TruckFull | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchTruckByPlate = async (licensePlate: string) => {
    isLoading.value = true
    error.value = null
    truck.value = null

    try {
      // Try the formatted version first (for consistent lookup)
      const formattedPlate = formatLicensePlate(licensePlate)
      
      const { data, error: supaError } = await supabase
        .from('vehicles')
        .select(`
          *,
          routes (*),
          maintenance_logs (*)
        `)
        .eq('license_plate', formattedPlate)
        .single()

      if (supaError) {
        if (supaError.code === 'PGRST116') {
          error.value = 'Camión no encontrado'
        } else {
          error.value = supaError.message
        }
        return null
      }

      truck.value = data as TruckFull
      return data as TruckFull
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    truck,
    isLoading,
    error,
    searchTruckByPlate
  }
}
