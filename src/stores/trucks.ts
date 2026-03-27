import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { getErrorMessage } from '@/utils/formatters'
import type { Vehicle } from '@/types/models'

const PAGE_SIZE = 25

export const useTrucksStore = defineStore('trucks', () => {
  const trucks = ref<Vehicle[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const totalCount = ref(0)
  const currentPage = ref(1)

  const filteredTrucks = computed(() => {
    if (!searchQuery.value) return trucks.value
    
    const query = searchQuery.value.toLowerCase().trim()
    const cleanQuery = query.replace(/[\s\-·.]/g, '')

    return trucks.value.filter(truck => {
      const cleanPlate = truck.license_plate.toLowerCase().replace(/[\s\-·.]/g, '')
      return cleanPlate.includes(cleanQuery) ||
             truck.model.toLowerCase().includes(query) ||
             truck.status.toLowerCase().includes(query) ||
             (truck.brand || '').toLowerCase().includes(query)
    })
  })

  const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

  const fetchTrucks = async (page = 1) => {
    isLoading.value = true
    error.value = null
    try {
      // Get total count
      const { count } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
      totalCount.value = count || 0

      // Fetch page
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error: supaError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to)
        
      if (supaError) throw supaError
      trucks.value = (data || []) as Vehicle[]
      currentPage.value = page
    } catch (err: unknown) {
      error.value = 'Error cargando los vehículos: ' + getErrorMessage(err)
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createTruck = async (payload: Omit<Vehicle, 'id' | 'created_at'>) => {
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
      
      await fetchTrucks(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error registrando el camión'
      throw err
    }
  }

  const updateTruck = async (id: string, payload: Partial<Vehicle>) => {
    error.value = null
    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', id)
        
      if (updateError) throw updateError
      
      await fetchTrucks(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error al actualizar el camión'
      throw err
    }
  }

  const deleteTruck = async (id: string) => {
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await fetchTrucks(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error al eliminar el camión'
      throw err
    }
  }

  return {
    trucks,
    isLoading,
    error,
    searchQuery,
    filteredTrucks,
    totalCount,
    currentPage,
    totalPages,
    fetchTrucks,
    createTruck,
    updateTruck,
    deleteTruck
  }
})
