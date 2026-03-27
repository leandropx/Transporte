import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { getErrorMessage } from '@/utils/formatters'
import type { Route } from '@/types/models'

const PAGE_SIZE = 25

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<Route[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const totalCount = ref(0)
  const currentPage = ref(1)

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

  const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

  const fetchRoutes = async (page = 1) => {
    isLoading.value = true
    error.value = null
    try {
      const { count } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })
      totalCount.value = count || 0

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error: supaError } = await supabase
        .from('routes')
        .select('*, vehicles(license_plate, model), workers(full_name)')
        .order('created_at', { ascending: false })
        .range(from, to)
        
      if (supaError) throw supaError
      routes.value = (data || []) as Route[]
      currentPage.value = page
    } catch (err: unknown) {
      error.value = 'Error cargando las rutas: ' + getErrorMessage(err)
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
      
      await fetchRoutes(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error registrando la ruta'
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
      
      await fetchRoutes(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error actualizando la ruta'
      throw err
    }
  }

  const deleteRoute = async (id: string) => {
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('routes')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await fetchRoutes(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error al eliminar la ruta'
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
    totalCount,
    currentPage,
    totalPages,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute
  }
})
