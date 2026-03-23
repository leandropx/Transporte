import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export interface SearchResult {
  id: string
  type: 'vehicle' | 'route' | 'maintenance' | 'worker'
  title: string
  subtitle: string
  metadata?: any
}

export function useGlobalSearch() {
  const results = ref<SearchResult[]>([])
  const isSearching = ref(false)
  const error = ref<string | null>(null)

  const performSearch = async (query: string) => {
    if (!query || query.length < 2) {
      results.value = []
      return
    }

    isSearching.value = true
    error.value = null
    const searchTerm = `%${query}%`

    try {
      // Execute multi-table queries concurrently
      const [vehiclesRes, routesRes, maintenanceRes, workersRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id, license_plate, model, status')
          .or(`license_plate.ilike.${searchTerm},model.ilike.${searchTerm},status.ilike.${searchTerm}`)
          .limit(5),
          
        supabase
          .from('routes')
          .select('id, origin, destination, status, start_date, vehicles(license_plate)')
          .or(`origin.ilike.${searchTerm},destination.ilike.${searchTerm},status.ilike.${searchTerm}`)
          .limit(5),
          
        supabase
          .from('maintenance_logs')
          .select('id, type, description, cost, maintenance_date, vehicles(license_plate)')
          .or(`type.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(5),

        supabase
          .from('workers')
          .select('id, rut, full_name, status, license_type')
          .or(`rut.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
          .limit(5)
      ])

      const combinedResults: SearchResult[] = []

      // Parse Vehicles
      if (vehiclesRes.data) {
        vehiclesRes.data.forEach(v => {
          combinedResults.push({
            id: v.license_plate, // Since we route by license plate for trucks
            type: 'vehicle',
            title: v.license_plate,
            subtitle: `${v.model} - ${v.status}`,
            metadata: v
          })
        })
      }

      // Parse Routes
      if (routesRes.data) {
        routesRes.data.forEach(r => {
          combinedResults.push({
            id: String(r.id),
            type: 'route',
            title: `${r.origin} ➔ ${r.destination}`,
            subtitle: `Camión: ${r.vehicles?.license_plate || '?'} - ${r.status}`,
            metadata: r
          })
        })
      }

      // Parse Maintenance
      if (maintenanceRes.data) {
        maintenanceRes.data.forEach(m => {
          combinedResults.push({
            id: String(m.id),
            type: 'maintenance',
            title: m.description,
            subtitle: `Camión: ${m.vehicles?.license_plate || '?'} - ${m.type} ($${m.cost})`,
            metadata: m
          })
        })
      }

      // Parse Workers
      if (workersRes.data) {
        workersRes.data.forEach(w => {
          combinedResults.push({
            id: String(w.id),
            type: 'worker',
            title: w.full_name,
            subtitle: `RUT: ${w.rut} - Licencia ${w.license_type}`,
            metadata: w
          })
        })
      }

      results.value = combinedResults
    } catch (err: any) {
      error.value = err.message || 'Error al realizar la búsqueda'
      results.value = []
    } finally {
      isSearching.value = false
    }
  }

  return {
    results,
    isSearching,
    error,
    performSearch
  }
}
