<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    <!-- Top Bar with Search Context -->
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Perfil del Camión
          <span class="inline-flex items-center px-3 py-1 rounded-full text-lg font-bold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm font-mono tracking-wider">
            {{ licensePlate }}
          </span>
        </h1>
      </div>
      <div class="w-full sm:w-96">
        <GlobalSearch size="regular" />
      </div>
    </div>

    <!-- State 1: Loading Skeleton -->
    <div v-if="isLoading" class="animate-pulse space-y-8">
      <!-- Skeleton Header Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-32">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <!-- Skeleton Content Areas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96"></div>
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96"></div>
      </div>
    </div>

    <!-- State 2: Empty / Not Found -->
    <div v-else-if="error || !truck" class="glass-panel rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
      <div class="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle class="h-12 w-12 text-red-500" />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Camión no encontrado</h2>
      <p class="text-gray-500 mb-8 text-lg">
        La patente <strong class="font-mono">{{ licensePlate }}</strong> no existe en los registros actuales.
      </p>
      <button class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
        <Plus class="h-5 w-5 mr-2" />
        Registrar nuevo camión con esta patente
      </button>
    </div>

    <!-- State 3: Data Loaded -->
    <div v-else class="space-y-8 fade-in">
      
      <!-- Metrics Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Status Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden group">
          <div :class="['absolute right-0 top-0 w-2 h-full', statusColorClass]"></div>
          <p class="text-sm font-medium text-gray-500 mb-1">Estado Actual</p>
          <div class="flex items-center gap-3">
            <div :class="['w-4 h-4 rounded-full animate-pulse', statusBadgeClass]"></div>
            <h3 class="text-2xl font-bold text-gray-900 capitalize">{{ truck.status }}</h3>
          </div>
        </div>

        <!-- Model Context -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-1">
            <Truck class="h-5 w-5 text-gray-400" />
            <p class="text-sm font-medium text-gray-500">Modelo y Capacidad</p>
          </div>
          <h3 class="text-xl font-bold text-gray-900">{{ truck.model }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ truck.capacity }} tons</p>
        </div>

        <!-- Aggregated Cost -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
          <div class="flex items-center gap-3 mb-1">
            <Wrench class="h-5 w-5 text-gray-400" />
            <p class="text-sm font-medium text-gray-500">Costo Histórico de Mantención</p>
          </div>
          <h3 class="text-2xl font-bold text-gray-900">${{ totalMaintenanceCost.toLocaleString() }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ truck.maintenance_logs?.length || 0 }} intervenciones</p>
        </div>
      </div>

      <!-- Main Content Split -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Routes Column -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <Map class="h-5 w-5 mr-2 text-brand-500" /> Rutas Recientes
            </h3>
            <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{{ truck.routes?.length || 0 }}</span>
          </div>
          
          <div class="p-6 flex-grow overflow-y-auto max-h-[500px]">
            <div v-if="!truck.routes?.length" class="text-center py-10 text-gray-500">
              <MapPin class="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p>No hay rutas registradas para este vehículo.</p>
            </div>
            
            <div v-else class="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              <div v-for="route in sortedRoutes" :key="route.id" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <!-- Timeline dot -->
                <div class="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors z-10">
                  <Navigation class="w-4 h-4" />
                </div>
                
                <!-- Card -->
                <div class="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex items-center justify-between mb-2">
                    <span :class="['text-xs font-semibold px-2 py-1 rounded-full', routeStatusBadge(route.status)]">{{ route.status }}</span>
                    <time class="text-xs text-gray-400 font-medium">{{ formatDate(route.start_date) }}</time>
                  </div>
                  <div class="flex flex-col gap-2 relative">
                    <div class="flex items-start gap-2">
                      <div class="mt-1 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-50 shrink-0"></div>
                      <span class="text-sm font-medium text-gray-900">{{ route.origin }}</span>
                    </div>
                    <div class="absolute left-1 top-4 bottom-4 w-px bg-gray-200"></div>
                    <div class="flex items-start gap-2">
                      <div class="mt-1 w-2 h-2 rounded-full bg-brand-500 shrink-0"></div>
                      <span class="text-sm font-medium text-gray-900">{{ route.destination }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Maintenance Column -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <Tool class="h-5 w-5 mr-2 text-brand-500" /> Historial de Mantenciones
            </h3>
            <button class="text-sm text-brand-600 hover:text-brand-700 font-medium">+ Registrar</button>
          </div>
          
          <div class="p-0 flex-grow overflow-y-auto max-h-[500px]">
            <div v-if="!truck.maintenance_logs?.length" class="text-center py-10 text-gray-500">
              <PenTool class="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <p>El vehículo no tiene registro de mantenciones.</p>
            </div>
            
            <ul v-else class="divide-y divide-gray-100">
              <li v-for="log in sortedMaintenance" :key="log.id" class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <span :class="['px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide', log.type === 'preventivo' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800']">
                      {{ log.type }}
                    </span>
                    <span class="text-sm text-gray-500 font-medium">{{ formatDate(log.maintenance_date) }}</span>
                  </div>
                  <span class="font-bold text-gray-900">${{ log.cost.toLocaleString() }}</span>
                </div>
                
                <p class="text-gray-700 text-sm mt-2 font-medium">{{ log.description }}</p>
                
                <div v-if="log.replaced_parts?.length" class="mt-3 flex flex-wrap gap-2">
                  <span v-for="(part, idx) in log.replaced_parts" :key="idx" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    <Settings class="w-3 h-3 mr-1 text-gray-400" />
                    {{ part }}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useTruckSearch } from '@/composables/useTruckSearch'
import GlobalSearch from '@/components/GlobalSearch.vue'
import { 
  AlertTriangle, Truck, Wrench, Map, MapPin, 
  PenTool as Tool, PenTool, Plus, Navigation, Settings
} from 'lucide-vue-next'

const props = defineProps<{
  licensePlate: string
}>()

const { truck, isLoading, error, searchTruckByPlate } = useTruckSearch()

// Fetch data when component mounts or licensePlate prop changes
watch(() => props.licensePlate, (newPlate) => {
  if (newPlate) {
    searchTruckByPlate(newPlate)
  }
}, { immediate: true })

// Computed Properties for Presentation
const totalMaintenanceCost = computed(() => {
  if (!truck.value?.maintenance_logs) return 0
  return truck.value.maintenance_logs.reduce((sum, log) => sum + Number(log.cost), 0)
})

const sortedRoutes = computed(() => {
  if (!truck.value?.routes) return []
  return [...truck.value.routes].sort((a, b) => {
    return new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
  })
})

const sortedMaintenance = computed(() => {
  if (!truck.value?.maintenance_logs) return []
  return [...truck.value.maintenance_logs].sort((a, b) => {
    return new Date(b.maintenance_date).getTime() - new Date(a.maintenance_date).getTime()
  })
})

const statusColorClass = computed(() => {
  switch(truck.value?.status) {
    case 'disponible': return 'bg-status-available'
    case 'en ruta': return 'bg-status-enroute'
    case 'en taller': return 'bg-status-maintenance'
    default: return 'bg-status-inactive'
  }
})

const statusBadgeClass = computed(() => {
  switch(truck.value?.status) {
    case 'disponible': return 'bg-status-available shadow-[0_0_10px_rgba(16,185,129,0.5)]'
    case 'en ruta': return 'bg-status-enroute shadow-[0_0_10px_rgba(59,130,246,0.5)]'
    case 'en taller': return 'bg-status-maintenance shadow-[0_0_10px_rgba(239,68,68,0.5)]'
    default: return 'bg-status-inactive'
  }
})

const routeStatusBadge = (status: string) => {
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
  return new Intl.DateTimeFormat('es-CL', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  }).format(new Date(dateString))
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
