import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export interface Worker {
  id: string
  rut: string
  full_name: string
  license_type: string
  status: string
}

export const useWorkersStore = defineStore('workers', () => {
  const workers = ref<Worker[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')

  const filteredWorkers = computed(() => {
    if (!searchQuery.value) return workers.value
    
    const query = searchQuery.value.toLowerCase().trim()
    return workers.value.filter(worker => 
      worker.full_name.toLowerCase().includes(query) ||
      worker.rut.toLowerCase().includes(query) ||
      worker.license_type.toLowerCase().includes(query) ||
      worker.status.toLowerCase().includes(query)
    )
  })

  const activeWorkers = computed(() => {
    return workers.value.filter(w => w.status === 'activo')
  })

  const fetchWorkers = async () => {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: supaError } = await supabase
        .from('workers')
        .select('*')
        .order('full_name', { ascending: true })
        
      if (supaError) throw supaError
      workers.value = data || []
    } catch (err: any) {
      error.value = 'Error cargando los conductores: ' + (err.message || '')
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createWorker = async (payload: Omit<Worker, 'id'>) => {
    error.value = null
    try {
      const { error: insertError } = await supabase
        .from('workers')
        .insert([payload])
        
      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Ya existe un trabajador registrado con este RUT.')
        }
        throw insertError
      }
      
      await fetchWorkers()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error registrando el conductor'
      throw err
    }
  }

  const updateWorker = async (id: string, payload: Partial<Worker>) => {
    error.value = null
    try {
      const { error: updateError } = await supabase
        .from('workers')
        .update(payload)
        .eq('id', id)
        
      if (updateError) throw updateError
      
      await fetchWorkers()
      return true
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el conductor'
      throw err
    }
  }

  return {
    workers,
    isLoading,
    error,
    searchQuery,
    filteredWorkers,
    activeWorkers,
    fetchWorkers,
    createWorker,
    updateWorker
  }
})
