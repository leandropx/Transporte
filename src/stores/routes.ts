import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface VehicleRef {
  license_plate: string
}

export interface WorkerRef {
  full_name: string
}

export interface Route {
  id: string
  vehicle_id: string
  driver_id: string | null
  origin: string
  destination: string
  status: string
  start_date: string | null
  end_date: string | null
  created_at?: string
  vehicles?: VehicleRef
  workers?: WorkerRef
}

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<Route[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredRoutes = computed(() => {
    if (!searchQuery.value) return routes.value
    
    const query = searchQuery.value.toLowerCase().trim()
    return routes.value.filter(route => 
      route.origin.toLowerCase().includes(query) ||
      route.destination.toLowerCase().includes(query) ||
      route.status.toLowerCase().includes(query) ||
      (route.vehicles?.license_plate || '').toLowerCase().includes(query) ||
      (route.workers?.full_name || '').toLowerCase().includes(query)
    )
  })

  const activeRoutes = computed(() => {
    return routes.value.filter(r => r.status === 'en curso' || r.status === 'planeada')
  })

  const fetchRoutes = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: supaError } = await supabase
        .from('routes')
        .select('*, vehicles(license_plate, model), workers(full_name)')
        .order('created_at', { ascending: false })
        .limit(100)
        
      if (supaError) throw supaError
      routes.value = data || []
    } catch (err: any) {
      error.value = 'Error cargando las rutas: ' + (err.message || '')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createRoute = async (payload: Partial<Route>) => {
    error.value = null
    try {
      const { error: insertError } = await supabase
        .from('routes')
        .insert([payload])
        
      if (insertError) throw insertError
      
      await fetchRoutes()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error registrando la ruta'
      throw err
    }
  }

  const updateRoute = async (id: string, payload: Partial<Route>) => {
    error.value = null
    try {
      const { error: updateError } = await supabase
        .from('routes')
        .update(payload)
        .eq('id', id)
        
      if (updateError) throw updateError
      
      await fetchRoutes()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error actualizando la ruta'
      throw err
    }
  }

  return {
    routes,
    isLoading,
    error,
    searchQuery,
    filteredRoutes,
    activeRoutes,
    fetchRoutes,
    createRoute,
    updateRoute
  }
})
