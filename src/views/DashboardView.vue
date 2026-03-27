<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
        <LayoutDashboard class="h-8 w-8 text-brand-600" /> Dashboard
      </h1>
      <p class="mt-1 text-gray-500">Vista general de la operación de la flota.</p>
    </div>

    <!-- Global Search -->
    <div class="mb-8">
      <GlobalSearch size="large" />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="card in kpiCards" :key="card.label" 
           class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-500">{{ card.label }}</span>
          <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', card.iconBg]">
            <component :is="card.icon" :class="['w-5 h-5', card.iconColor]" />
          </div>
        </div>
        <div class="text-2xl font-bold text-gray-900" v-if="!isLoading">{{ card.value }}</div>
        <div v-else class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>

    <!-- Recent Activity Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-900">Actividad Reciente</h2>
      </div>
      <div v-if="isLoading" class="p-6 space-y-3">
        <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div v-else-if="recentRoutes.length === 0" class="p-8 text-center text-gray-500 text-sm">
        Sin actividad reciente que mostrar.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camión</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trayecto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="route in recentRoutes" :key="route.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-3 text-sm font-mono font-bold text-gray-800">
                {{ route.vehicles?.license_plate ? formatLicensePlate(route.vehicles.license_plate) : '—' }}
              </td>
              <td class="px-6 py-3 text-sm text-gray-700">{{ route.origin }} → {{ route.destination }}</td>
              <td class="px-6 py-3">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', statusBadge(route.status)]">{{ route.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { formatLicensePlate, getErrorMessage } from '@/utils/formatters'
import GlobalSearch from '@/components/GlobalSearch.vue'
import { LayoutDashboard, Truck, Map, Users, Wrench } from 'lucide-vue-next'

const isLoading = ref(true)
const vehicleCount = ref(0)
const activeRouteCount = ref(0)
const workerCount = ref(0)
const maintenanceCount = ref(0)
const recentRoutes = ref<any[]>([])

const kpiCards = computed(() => [
  { label: 'Vehículos', value: vehicleCount.value, icon: Truck, iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
  { label: 'Rutas Activas', value: activeRouteCount.value, icon: Map, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Conductores', value: workerCount.value, icon: Users, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { label: 'Mantenciones', value: maintenanceCount.value, icon: Wrench, iconBg: 'bg-red-50', iconColor: 'text-red-600' }
])

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const [vehicles, routes, workers, maintenance, recent] = await Promise.all([
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('routes').select('*', { count: 'exact', head: true }).in('status', ['en curso', 'planeada']),
      supabase.from('workers').select('*', { count: 'exact', head: true }),
      supabase.from('maintenance_logs').select('*', { count: 'exact', head: true }),
      supabase.from('routes').select('*, vehicles(license_plate)').order('created_at', { ascending: false }).limit(5)
    ])

    vehicleCount.value = vehicles.count || 0
    activeRouteCount.value = routes.count || 0
    workerCount.value = workers.count || 0
    maintenanceCount.value = maintenance.count || 0
    recentRoutes.value = recent.data || []
  } catch (err: unknown) {
    console.error('Dashboard error:', getErrorMessage(err))
  } finally {
    isLoading.value = false
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

onMounted(() => {
  fetchDashboardData()
})
</script>
