<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Map class="h-8 w-8 text-brand-600" /> Registro de Rutas
        </h1>
        <p class="text-gray-500 mt-1">Gesti&oacute;n y monitoreo continuo de los viajes de la flota.</p>
      </div>
      <button 
        @click="isModalOpen = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors"
      >
        <Plus class="h-5 w-5 mr-2" /> Nueva Ruta
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="animate-pulse space-y-4">
      <div v-for="i in 5" :key="i" class="h-16 bg-white rounded-xl shadow-sm border border-gray-100"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 p-4 border border-red-200 rounded-xl text-red-600">
      <AlertTriangle class="h-5 w-5 inline mr-2" /> {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="routes.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <MapPin class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay rutas registradas</h3>
      <p class="text-sm text-gray-500 mt-1">Agrega una nueva ruta para empezar a monitorear.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Camión (Patente)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trayecto</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="route in routes" :key="route.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200 font-mono">
                {{ route.vehicles?.license_plate || 'Desconocido' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ route.origin }}</div>
              <div class="text-xs text-gray-500">hacia <span class="font-medium text-gray-700">{{ route.destination }}</span></div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', statusBadge(route.status)]">
                {{ route.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex items-center gap-1"><Calendar class="w-4 h-4 text-gray-400" /> {{ formatDate(route.start_date) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for New Route -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">Registrar Nueva Ruta</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitRoute" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" /> {{ formError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patente del Vehículo *</label>
            <input v-model="form.license" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 uppercase font-mono" placeholder="AB-1234" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Origen *</label>
              <input v-model="form.origin" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Santiago" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
              <input v-model="form.destination" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Valparaíso" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input v-model="form.start_date" type="date" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" />
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              Guardar Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { Map, Plus, AlertTriangle, MapPin, Calendar, X, Loader2 } from 'lucide-vue-next'

const routes = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const form = ref({
  license: '',
  origin: '',
  destination: '',
  start_date: new Date().toISOString().split('T')[0]
})

const fetchRoutes = async () => {
  try {
    isLoading.value = true
    const { data, error: supaError } = await supabase
      .from('routes')
      .select('*, vehicles(license_plate)')
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (supaError) throw supaError
    routes.value = data || []
  } catch (err: any) {
    error.value = 'Error cargando las rutas: ' + (err.message || '')
  } finally {
    isLoading.value = false
  }
}

const submitRoute = async () => {
  formError.value = ''
  isSubmitting.value = true
  
  try {
    // 1. Find vehicle ID by license plate
    const { data: vData, error: vError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('license_plate', form.value.license.toUpperCase().trim())
      .single()
      
    if (vError || !vData) {
      throw new Error('Vehículo no encontrado verificando la patente.')
    }
    
    // 2. Insert new route
    const { error: insertError } = await supabase
      .from('routes')
      .insert({
        vehicle_id: vData.id,
        origin: form.value.origin.trim(),
        destination: form.value.destination.trim(),
        start_date: new Date(form.value.start_date).toISOString(),
        status: 'planeada'
      })
      
    if (insertError) throw insertError
    
    // Success
    isModalOpen.value = false
    form.value = { license: '', origin: '', destination: '', start_date: new Date().toISOString().split('T')[0] }
    await fetchRoutes() // refresh
    
  } catch (err: any) {
    formError.value = err.message || 'Error al guardar la ruta'
  } finally {
    isSubmitting.value = false
  }
}

const statusBadge = (status: string) => {
  switch(status) {
    case 'completada': return 'bg-green-100 text-green-800'
    case 'en curso': return 'bg-blue-100 text-blue-800'
    case 'planeada': return 'bg-gray-100 text-gray-800'
    case 'cancelada': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString))
}

onMounted(() => {
  fetchRoutes()
})
</script>
