<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <!-- Hero Section with Search -->
    <div class="text-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden transition-all duration-500">
      <!-- Decorative background blur -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-50 rounded-[100%] blur-3xl opacity-50 -z-10"></div>
      
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl relative z-10 transition-transform" :class="{'scale-95 opacity-90': searchQuery}">
        Centro de Control
      </h1>
      <p v-if="!searchQuery" class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto relative z-10 animate-fade-in">
        Monitorea flotas, conductores y viajas en tiempo real.
      </p>
      
      <div class="max-w-4xl mx-auto mt-8 relative z-10 flex flex-col sm:flex-row gap-3">
        <!-- Buscador de Texto -->
        <div class="relative group flex-1">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search class="h-6 w-6 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-transparent shadow-lg rounded-2xl text-lg leading-5 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium text-gray-900"
            placeholder="Buscar por patente AB-1234, nombre de chofer, origen o destino..."
            autocomplete="off"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Buscador de Fecha -->
        <div class="relative group sm:w-56 shrink-0">
          <input
            v-model="dateQuery"
            type="date"
            class="block w-full pl-4 pr-10 py-4 bg-white/80 backdrop-blur-sm border-2 border-transparent shadow-lg rounded-2xl text-base leading-5 text-gray-900 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
            title="Filtrar por fecha de viaje"
          />
          <button v-if="dateQuery" @click="dateQuery = ''" class="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Stats Hub (Oculto si hay búsqueda) -->
    <div v-show="!searchQuery && !dateQuery" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      <!-- Stats 1: Camiones -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/trucks')">
        <div class="h-14 w-14 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
          <Truck class="h-7 w-7 text-brand-600" />
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-500">Flota Vehicular</div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900">{{ isLoading ? '-' : truckStore.trucks.length }}</span>
            <span class="text-sm font-medium text-green-600">Total</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ isLoading ? '...' : activeTrucksCount }} disponibles / en ruta.</p>
        </div>
      </div>

      <!-- Stats 2: Conductores -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/workers')">
        <div class="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Users class="h-7 w-7 text-blue-600" />
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-500">Personal</div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900">{{ isLoading ? '-' : workerStore.workers.length }}</span>
            <span class="text-sm font-medium text-blue-600">Choferes</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ isLoading ? '...' : workerStore.activeWorkers.length }} en estado activo.</p>
        </div>
      </div>

      <!-- Stats 3: Rutas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/routes')">
        <div class="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
          <Map class="h-7 w-7 text-orange-600" />
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-500">Viajes</div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900">{{ isLoading ? '-' : routeStore.activeRoutes.length }}</span>
            <span class="text-sm font-medium text-orange-600">Activos</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">{{ isLoading ? '...' : completedRoutesCount }} viajes completados en historial.</p>
        </div>
      </div>

      <!-- Stats 4: Alertas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" @click="$router.push('/trucks')">
        <div class="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <AlertCircle class="h-7 w-7 text-red-600" />
        </div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-500">En Taller</div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-gray-900">{{ isLoading ? '-' : workshopTrucksCount }}</span>
            <span class="text-sm font-medium text-red-600">Camiones</span>
          </div>
          <p class="text-xs text-gray-400 mt-1">Requieren atención pronto.</p>
        </div>
      </div>
    </div>

    <!-- Resultados Dinámicos (Solo si hay búsqueda) -->
    <div v-show="(searchQuery || dateQuery) && !isLoading" class="animate-fade-in space-y-6">
      
      <!-- Panel de Asociaciones -->
      <div v-if="associatedResults.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div v-for="(assoc, index) in associatedResults" :key="index" class="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
          
          <!-- Encabezado de la entidad encontrada -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="['p-2 rounded-xl', badgeColor(assoc.type).bg]">
                 <component :is="getIcon(assoc.type)" :class="['w-6 h-6', badgeColor(assoc.type).text]" />
              </div>
              <div>
                <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{ translateType(assoc.type) }} ENCONTRADO</span>
                <h3 class="text-lg font-bold text-gray-900 font-mono tracking-tight">{{ assoc.mainTitle }}</h3>
              </div>
            </div>
            
            <button @click="navigate(assoc)" class="inline-flex text-sm text-brand-600 font-medium hover:text-brand-800 transition-colors">
              Ver Ficha <ArrowRight class="w-4 h-4 ml-1 mt-0.5" />
            </button>
          </div>

          <!-- Cuerpo asociativo -->
          <div class="p-6">
            <p class="text-gray-600 text-sm mb-5">{{ assoc.subtitle }}</p>
            
            <!-- Red asociativa -->
            <div v-if="assoc.relations.length > 0" class="space-y-3">
              <div class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Asociaciones Activas</div>
              
              <div v-for="(rel, idx) in assoc.relations" :key="idx" class="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                 <component :is="getIcon(rel.type)" class="w-5 h-5 text-gray-400" />
                 <div class="flex-1">
                   <div class="text-sm font-medium text-gray-800">{{ rel.title }}</div>
                   <div class="text-xs text-gray-500">{{ rel.desc }}</div>
                 </div>
                 <div :class="['px-2 py-1 text-[10px] font-bold rounded-lg uppercase', rel.statusColor]">
                   {{ rel.status }}
                 </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Link2Off class="w-6 h-6 text-gray-300 mx-auto mb-2" />
              <span class="text-sm text-gray-500">Sin asociaciones en curso</span>
            </div>
            
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-20 bg-white rounded-3xl border border-gray-200">
        <Search class="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900">Sin coincidencias cruzadas</h3>
        <p class="text-gray-500 mt-2">No hemos encontrado ningún registro activo con tus criterios de búsqueda actuales.</p>
      </div>
      
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Truck, Users, Map, AlertCircle, Search, X, MapPin, Navigation, ArrowRight, UserCheck, Link2Off } from 'lucide-vue-next'

import { useTrucksStore } from '@/stores/trucks'
import { useWorkersStore } from '@/stores/workers'
import { useRoutesStore } from '@/stores/routes'

const router = useRouter()
const truckStore = useTrucksStore()
const workerStore = useWorkersStore()
const routeStore = useRoutesStore()

const isLoading = ref(true)
const searchQuery = ref('')
const dateQuery = ref('')

const activeTrucksCount = computed(() => truckStore.trucks.filter(t => t.status === 'disponible' || t.status === 'en ruta').length)
const workshopTrucksCount = computed(() => truckStore.trucks.filter(t => t.status === 'en taller').length)
const completedRoutesCount = computed(() => routeStore.routes.filter(r => r.status === 'completada').length)

// Advanced Reactive Association Logic
const associatedResults = computed(() => {
  if (!searchQuery.value && !dateQuery.value) return []
  
  const query = searchQuery.value.toLowerCase().trim()
  const filterDate = dateQuery.value // 'YYYY-MM-DD'
  const results: any[] = []

  // Check if a route matches the date exactly
  const doesRouteDateMatch = (r: any) => {
    if (!filterDate) return true // if no date filter, pass
    if (!r.start_date) return false // if filter exists but route has no date, fail
    // route.start_date is an ISO string, check startsWith
    return r.start_date.substring(0, 10) === filterDate
  }

  // 1. Search Trucks
  const matchedTrucks = truckStore.trucks.filter(t => {
    const textMatch = !query || t.license_plate.toLowerCase().includes(query) || t.model.toLowerCase().includes(query)
    if (!textMatch) return false
    
    // If dateFilter exists, only include trucks that have ANY route on that date
    if (filterDate) {
      return routeStore.routes.some(r => r.vehicle_id === t.id && doesRouteDateMatch(r))
    }
    return true
  })
  
  matchedTrucks.forEach(truck => {
    // Determine which route to show. If filtering by date, show the one matching the date. Else show active.
    let activeRoute: any = null
    if (filterDate) {
      activeRoute = routeStore.routes.find(r => r.vehicle_id === truck.id && doesRouteDateMatch(r))
    } else {
      activeRoute = routeStore.routes.find(r => r.vehicle_id === truck.id && (r.status === 'en curso' || r.status === 'planeada'))
    }

    const relations = []
    
    if (activeRoute) {
      relations.push({
        type: 'route',
        title: `${activeRoute.origin} a ${activeRoute.destination}`,
        desc: 'Ruta Asignada',
        status: activeRoute.status,
        statusColor: activeRoute.status === 'en curso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
      })
      
      if (activeRoute.driver_id) {
        const driver = workerStore.workers.find(w => w.id === activeRoute.driver_id)
        if (driver) {
          relations.push({
            type: 'worker',
            title: driver.full_name,
            desc: `Chofer (RUT: ${driver.rut})`,
            status: driver.status,
            statusColor: 'bg-green-100 text-green-700'
          })
        }
      }
    }

    results.push({
      type: 'vehicle',
      id: truck.license_plate, // Used for routing
      mainTitle: truck.license_plate,
      subtitle: `${truck.model} | Estado Actual: ${truck.status.toUpperCase()}`,
      relations
    })
  })

  // 2. Search Workers
  const matchedWorkers = workerStore.workers.filter(w => {
    const textMatch = !query || w.full_name.toLowerCase().includes(query) || w.rut.toLowerCase().includes(query)
    if (!textMatch) return false
    if (filterDate) {
      return routeStore.routes.some(r => r.driver_id === w.id && doesRouteDateMatch(r))
    }
    return true
  })

  matchedWorkers.forEach(worker => {
    let activeRoute: any = null
    if (filterDate) {
      activeRoute = routeStore.routes.find(r => r.driver_id === worker.id && doesRouteDateMatch(r))
    } else {
      activeRoute = routeStore.routes.find(r => r.driver_id === worker.id && (r.status === 'en curso' || r.status === 'planeada'))
    }

    const relations = []
    
    if (activeRoute) {
      relations.push({
        type: 'route',
        title: `${activeRoute.origin} a ${activeRoute.destination}`,
        desc: 'Ruta Asignada',
        status: activeRoute.status,
        statusColor: activeRoute.status === 'en curso' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
      })
      
      const truck = truckStore.trucks.find(t => t.id === activeRoute.vehicle_id)
      if (truck) {
        relations.push({
          type: 'vehicle',
          title: truck.license_plate,
          desc: `Camión Asignado (${truck.model})`,
          status: truck.status,
          statusColor: 'bg-brand-100 text-brand-700'
        })
      }
    }

    results.push({
      type: 'worker',
      id: worker.id,
      mainTitle: worker.full_name,
      subtitle: `RUT: ${worker.rut} | Licencia ${worker.license_type}`,
      relations
    })
  })

  // 3. Search Routes (by origin/destination AND date)
  const matchedRoutes = routeStore.routes.filter(r => {
    const textMatch = !query || r.origin.toLowerCase().includes(query) || r.destination.toLowerCase().includes(query)
    const dateMatch = doesRouteDateMatch(r)
    return textMatch && dateMatch
  })

  matchedRoutes.forEach(route => {
    // Avoid duplicating if we already caught it via truck or worker, but simpler: just render it.
    // To prevent mass duplicates in this view, we check if it's already implicitly shown (optional optimization)
    const relations = []
    
    const truck = truckStore.trucks.find(t => t.id === route.vehicle_id)
    if (truck) {
      relations.push({
        type: 'vehicle',
        title: truck.license_plate,
        desc: `Camión Transportista`,
        status: truck.status,
        statusColor: 'bg-brand-100 text-brand-700'
      })
    }

    if (route.driver_id) {
      const driver = workerStore.workers.find(w => w.id === route.driver_id)
      if (driver) {
        relations.push({
          type: 'worker',
          title: driver.full_name,
          desc: `Conductor al Mando`,
          status: driver.status,
          statusColor: 'bg-green-100 text-green-700'
        })
      }
    }

    results.push({
      type: 'route',
      id: route.id,
      mainTitle: `${route.origin} a ${route.destination}`,
      subtitle: `Viaje ID: ${route.id.split('-')[0]} | Fecha: ${route.start_date ? new Date(route.start_date).toLocaleDateString() : 'N/A'}`,
      relations
    })
  })

  // Eliminar duplicados absolutos si los hay iterando un set único (Opcional, pero para mantenerlo ligero lo devolvemos directo)
  // Devuelve máximo 10 hubs asociativos para mantener la UI limpia.
  return results.slice(0, 10)
})

const getIcon = (type: string) => {
  switch (type) {
    case 'vehicle': return Truck
    case 'worker': return Users
    case 'route': return Map
    default: return Navigation
  }
}

const badgeColor = (type: string) => {
  switch (type) {
    case 'vehicle': return { bg: 'bg-brand-100', text: 'text-brand-700' }
    case 'worker': return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'route': return { bg: 'bg-orange-100', text: 'text-orange-700' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-700' }
  }
}

const translateType = (type: string) => {
  switch (type) {
    case 'vehicle': return 'Volquete / Camión'
    case 'worker': return 'Conductor'
    case 'route': return 'Ruta / Viaje'
    default: return 'Registro'
  }
}

const navigate = (assoc: any) => {
  if (assoc.type === 'vehicle') {
    router.push({ name: 'truck-360', params: { licensePlate: assoc.id } })
  } else if (assoc.type === 'worker') {
    router.push('/workers')
  } else if (assoc.type === 'route') {
    router.push('/routes')
  }
}

onMounted(async () => {
  // Aseguramos que la red local in-memory esté totalmente cargada.
  await Promise.allSettled([
    truckStore.fetchTrucks(),
    workerStore.fetchWorkers(),
    routeStore.fetchRoutes()
  ])
  isLoading.value = false
})
</script>
