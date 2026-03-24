<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Map class="h-8 w-8 text-brand-600" /> Registro de Rutas
        </h1>
        <p class="text-gray-500 mt-1">Gestión y monitoreo continuo de los viajes de la flota.</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors shrink-0"
      >
        <Plus class="h-5 w-5 mr-2" /> Nueva Ruta
      </button>
    </div>

    <!-- Buscador Local -->
    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="h-5 w-5 text-gray-400" />
      </div>
      <input
        v-model="routeStore.searchQuery"
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
        placeholder="Filtrar por origen, destino, patente o status..."
      />
    </div>

    <!-- Loading State -->
    <div v-if="routeStore.isLoading || isInitializingLocal" class="animate-pulse space-y-4">
      <div v-for="i in 5" :key="i" class="h-16 bg-white rounded-xl shadow-sm border border-gray-100"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="routeStore.error" class="bg-red-50 p-4 border border-red-200 rounded-xl text-red-600">
      <AlertTriangle class="h-5 w-5 inline mr-2" /> {{ routeStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="routeStore.routes.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <MapPin class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay rutas registradas</h3>
      <p class="text-sm text-gray-500 mt-1">Agrega una nueva ruta para empezar a monitorear.</p>
    </div>
    
    <!-- No Results Search -->
    <div v-else-if="routeStore.filteredRoutes.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Search class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay coincidencias</h3>
      <p class="text-sm text-gray-500 mt-1">Intenta con otra palabra clave en el buscador.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo / Conductor</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trayecto</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ajustes</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="route in routeStore.filteredRoutes" :key="route.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200 font-mono">
                PPU: {{ route.vehicles?.license_plate || 'NN' }}
              </span>
              <div class="text-xs text-gray-500 mt-1 flex items-center">
                <User class="w-3 h-3 mr-1" />
                {{ route.workers?.full_name || 'Sin asignar' }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900 flex items-center">
                {{ route.origin }} <ArrowRight class="w-3 h-3 mx-1 text-gray-400" /> {{ route.destination }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', statusBadge(route.status)]">
                {{ route.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex items-center gap-1"><Calendar class="w-4 h-4 text-gray-400" /> {{ formatDate(route.start_date) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(route)" class="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors">
                <Edit2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <!-- Modal for New/Edit Route -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Editar Ruta' : 'Registrar Nueva Ruta' }}</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitRoute" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" /> {{ formError }}
          </div>

          <div v-if="!isEditing">
            <label class="block text-sm font-medium text-gray-700 mb-1">Patente del Vehículo *</label>
            <input v-model="form.license" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 uppercase font-mono" placeholder="AB-1234" />
          </div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patente del Vehículo</label>
            <input :value="form.license" type="text" disabled class="block w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 font-mono" />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Conductor Asignado</label>
            <select v-model="form.driver_id" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
              <option value="">Seleccione un conductor (Opcional)</option>
              <option v-for="worker in workerStore.activeWorkers" :key="worker.id" :value="worker.id">
                {{ worker.full_name }} (Clase {{ worker.license_type }})
              </option>
            </select>
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

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
              <input v-model="form.start_date" type="date" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" />
            </div>
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.status" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="planeada">Planeada</option>
                <option value="en curso">En Curso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
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
import { useRoutesStore } from '@/stores/routes'
import { useWorkersStore } from '@/stores/workers'
import { Map, Plus, AlertTriangle, MapPin, Calendar, X, Loader2, Search, User, ArrowRight, Edit2 } from 'lucide-vue-next'

const routeStore = useRoutesStore()
const workerStore = useWorkersStore()

const isInitializingLocal = ref(true)
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  license: '',
  driver_id: '',
  origin: '',
  destination: '',
  status: 'planeada',
  start_date: new Date().toISOString().split('T')[0]
})

const openModal = (routeRecord: any = null) => {
  formError.value = ''
  if (routeRecord) {
    isEditing.value = true
    form.value = {
      id: routeRecord.id,
      license: routeRecord.vehicles?.license_plate || '',
      driver_id: routeRecord.driver_id || '',
      origin: routeRecord.origin,
      destination: routeRecord.destination,
      status: routeRecord.status,
      start_date: routeRecord.start_date ? new Date(routeRecord.start_date).toISOString().split('T')[0] : ''
    }
  } else {
    isEditing.value = false
    form.value = {
      id: '',
      license: '',
      driver_id: '',
      origin: '',
      destination: '',
      status: 'planeada',
      start_date: new Date().toISOString().split('T')[0]
    }
  }
  isModalOpen.value = true
}

const submitRoute = async () => {
  formError.value = ''
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      await routeStore.updateRoute(form.value.id, {
        origin: form.value.origin.trim(),
        destination: form.value.destination.trim(),
        driver_id: form.value.driver_id || null,
        status: form.value.status,
        start_date: form.value.start_date ? new Date(form.value.start_date).toISOString() : null
      })
    } else {
      let formattedPlate = form.value.license.toUpperCase().replace(/[\s-]/g, '')
      if (formattedPlate.length === 6) {
        if (/^[A-Z]{2}[0-9]{4}$/.test(formattedPlate)) {
          formattedPlate = formattedPlate.substring(0, 2) + '-' + formattedPlate.substring(2)
        } else if (/^[BCDFGHJKLPRSTVWXYZ]{4}[0-9]{2}$/.test(formattedPlate)) {
          formattedPlate = formattedPlate.substring(0, 4) + '-' + formattedPlate.substring(4)
        }
      }

      // Validating vehicle existance
      const { data: vData, error: vError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('license_plate', formattedPlate)
        .single()
        
      if (vError || !vData) {
        throw new Error('Vehículo no encontrado verificando la patente.')
      }
      
      await routeStore.createRoute({
        vehicle_id: vData.id,
        driver_id: form.value.driver_id || null,
        origin: form.value.origin.trim(),
        destination: form.value.destination.trim(),
        start_date: form.value.start_date ? new Date(form.value.start_date).toISOString() : null,
        status: 'planeada'
      })
    }
    
    isModalOpen.value = false
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

onMounted(async () => {
  // Load both stores info to have data ready for views and modals
  await Promise.all([
    routeStore.fetchRoutes(),
    workerStore.fetchWorkers()
  ])
  isInitializingLocal.value = false
})
</script>
