import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export interface Route {
  id: string
  origin: string
  destination: string
  status: string
  start_date: string | null
  end_date: string | null
}

export interface MaintenanceLog {
  id: string
  type: string
  description: string
  replaced_parts: string[]
  cost: number
  maintenance_date: string
}

export interface Truck {
  id: string
  license_plate: string
  model: string
  capacity: number
  status: string
  routes?: Route[]
  maintenance_logs?: MaintenanceLog[]
}

export function useTruckSearch() {
  const truck = ref<Truck | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const searchTruckByPlate = async (licensePlate: string) => {
    isLoading.value = true
    error.value = null
    truck.value = null

    try {
      // Usando "joins" de Supabase para obtener todo en una sola respuesta
      const { data, error: supaError } = await supabase
        .from('vehicles')
        .select(`
          *,
          routes (*),
          maintenance_logs (*)
        `)
        .eq('license_plate', licensePlate.toUpperCase().trim())
        .single()

      if (supaError) {
        if (supaError.code === 'PGRST116') {
          // Record not found
          error.value = 'Camión no encontrado'
        } else {
          error.value = supaError.message
        }
        return null
      }

      truck.value = data as Truck
      return data as Truck
    } catch (err: any) {
      error.value = err.message || 'Error inesperado durante la búsqueda'
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
