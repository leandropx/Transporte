<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Tool class="h-8 w-8 text-brand-600" /> Control de Mantenciones
        </h1>
        <p class="text-gray-500 mt-1">Historial y nuevos registros mecánicos de la flota.</p>
      </div>
      <button 
        @click="isModalOpen = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors"
      >
        <Plus class="h-5 w-5 mr-2" /> Registrar Mantención
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
    <div v-else-if="logs.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Wrench class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay mantenciones registradas</h3>
      <p class="text-sm text-gray-500 mt-1">Registra la primera intervención mecánica.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo & Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-gray-100 text-gray-800 border border-gray-200 font-mono">
                {{ log.vehicles?.license_plate || 'Desconocido' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2 mb-1">
                <span :class="['px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide', log.type === 'preventivo' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800']">
                  {{ log.type }}
                </span>
              </div>
              <div class="text-xs text-gray-500 flex items-center gap-1"><Calendar class="w-3 h-3" /> {{ formatDate(log.maintenance_date) }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 line-clamp-2 max-w-xs" :title="log.description">{{ log.description }}</div>
              <div v-if="log.replaced_parts?.length">
                <span class="text-xs text-gray-400 font-medium">Refacciones: {{ log.replaced_parts.join(', ') }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              ${{ log.cost.toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for New Maintenance -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="isModalOpen = false"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Registrar Mantención</h3>
            <p class="text-xs text-orange-600 font-medium mt-1">El estado del vehículo pasará a "en taller" automáticamente.</p>
          </div>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitLog" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" /> {{ formError }}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
              <input v-model="form.license" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 uppercase font-mono" placeholder="AB-1234" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Costo Total ($)</label>
              <input v-model.number="form.cost" type="number" min="0" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="0" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Mantención *</label>
            <select v-model="form.type" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 bg-white">
              <option value="preventivo">Preventivo</option>
              <option value="correctivo">Correctivo</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción Breve *</label>
            <textarea v-model="form.description" required rows="2" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 text-sm" placeholder="Ej: Cambio de aceite y filtros"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Repuestos (separados por coma)</label>
            <input v-model="form.parts" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500 text-sm" placeholder="Ej: Filtro de aceite, Neumáticos" />
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="isModalOpen = false" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              Guardar
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
import { PenTool as Tool, Plus, AlertTriangle, Wrench, Calendar, X, Loader2 } from 'lucide-vue-next'

const logs = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const form = ref({
  license: '',
  type: 'preventivo',
  description: '',
  cost: 0,
  parts: ''
})

const fetchLogs = async () => {
  try {
    isLoading.value = true
    const { data, error: supaError } = await supabase
      .from('maintenance_logs')
      .select('*, vehicles(license_plate)')
      .order('created_at', { ascending: false })
      .limit(50)
      
    if (supaError) throw supaError
    logs.value = data || []
  } catch (err: any) {
    error.value = 'Error cargando las mantenciones: ' + (err.message || '')
  } finally {
    isLoading.value = false
  }
}

const submitLog = async () => {
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
    
    // Parse parts into array string
    const partsArray = form.value.parts ? form.value.parts.split(',').map(p => p.trim()).filter(Boolean) : []
    
    // 2. Insert new maintenance log (trigger handles putting vehicle to 'en taller')
    const { error: insertError } = await supabase
      .from('maintenance_logs')
      .insert({
        vehicle_id: vData.id,
        type: form.value.type,
        description: form.value.description.trim(),
        cost: form.value.cost,
        replaced_parts: partsArray,
        maintenance_date: new Date().toISOString()
      })
      
    if (insertError) throw insertError
    
    // Success
    isModalOpen.value = false
    form.value = { license: '', type: 'preventivo', description: '', cost: 0, parts: '' }
    await fetchLogs() // refresh table
    
  } catch (err: any) {
    formError.value = err.message || 'Error al guardar el registro'
  } finally {
    isSubmitting.value = false
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString))
}

onMounted(() => {
  fetchLogs()
})
</script>
