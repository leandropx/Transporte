import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { getErrorMessage } from '@/utils/formatters'
import type { Worker } from '@/types/models'

const PAGE_SIZE = 25

export const useWorkersStore = defineStore('workers', () => {
  const workers = ref<Worker[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const totalCount = ref(0)
  const currentPage = ref(1)

  const filteredWorkers = computed(() => {
    if (!searchQuery.value) return workers.value
    
    const query = searchQuery.value.toLowerCase().trim()
    return workers.value.filter(worker => 
      worker.full_name.toLowerCase().includes(query) ||
      worker.rut.toLowerCase().includes(query) ||
      worker.license_type.toLowerCase().includes(query) ||
      (worker.status || '').toLowerCase().includes(query)
    )
  })

  const activeWorkers = computed(() => {
    return workers.value.filter(w => w.status === 'activo')
  })

  const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

  const fetchWorkers = async (page = 1) => {
    isLoading.value = true
    error.value = null
    try {
      const { count } = await supabase
        .from('workers')
        .select('*', { count: 'exact', head: true })
      totalCount.value = count || 0

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error: supaError } = await supabase
        .from('workers')
        .select('*')
        .order('full_name', { ascending: true })
        .range(from, to)
        
      if (supaError) throw supaError
      workers.value = (data || []) as Worker[]
      currentPage.value = page
    } catch (err: unknown) {
      error.value = 'Error cargando los conductores: ' + getErrorMessage(err)
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
      
      await fetchWorkers(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error registrando el conductor'
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
      
      await fetchWorkers(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error al actualizar el conductor'
      throw err
    }
  }

  const deleteWorker = async (id: string) => {
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('workers')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      await fetchWorkers(currentPage.value)
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || 'Error al eliminar el conductor'
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
    totalCount,
    currentPage,
    totalPages,
    fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker
  }
})
