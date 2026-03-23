import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface Truck {
  id: string
  license_plate: string
  model: string
  capacity: number
  status: string
  created_at?: string
}

export const useTrucksStore = defineStore('trucks', () => {
  const trucks = ref<Truck[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredTrucks = computed(() => {
    if (!searchQuery.value) return trucks.value
    
    const query = searchQuery.value.toLowerCase().trim()
    return trucks.value.filter(truck => 
      truck.license_plate.toLowerCase().includes(query) ||
      truck.model.toLowerCase().includes(query) ||
      truck.status.toLowerCase().includes(query)
    )
  })

  const fetchTrucks = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: supaError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (supaError) throw supaError
      trucks.value = data || []
    } catch (err: any) {
      error.value = 'Error cargando los vehículos: ' + (err.message || '')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createTruck = async (payload: Omit<Truck, 'id' | 'created_at'>) => {
    error.value = null
    try {
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([payload])
        
      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Ya existe un vehículo registrado con esa patente.')
        }
        throw insertError
      }
      
      // Optamos por refetch en lugar de update local para asegurar sync total
      await fetchTrucks()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error registrando el camión'
      throw err
    }
  }

  const updateTruck = async (id: string, payload: Partial<Truck>) => {
    error.value = null
    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', id)
        
      if (updateError) throw updateError
      
      await fetchTrucks()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el camión'
      throw err
    }
  }

  return {
    trucks,
    isLoading,
    error,
    searchQuery,
    filteredTrucks,
    fetchTrucks,
    createTruck,
    updateTruck
  }
})
