<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Truck class="h-8 w-8 text-brand-600" /> Directorio de Camiones
        </h1>
        <p class="text-gray-500 mt-1">Alta, edición y búsqueda de la flota de vehículos.</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors"
      >
        <Plus class="h-5 w-5 mr-2" /> Agregar Camión
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
    <div v-else-if="trucks.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Truck class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay camiones registrados</h3>
      <p class="text-sm text-gray-500 mt-1">Registra tu primer vehículo para comenzar la gestión.</p>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="truck in trucks" :key="truck.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold border font-mono tracking-wider cursor-pointer hover:bg-gray-100 transition"
                    @click="goToTruck(truck.license_plate)"
                    :class="['bg-gray-50 text-gray-800 border-gray-200 hover:text-brand-600 hover:border-brand-200']">
                {{ truck.license_plate }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ truck.model }}</div>
              <div class="text-xs text-gray-500">Capacidad: {{ truck.capacity }} tons</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', badgeClasses(truck.status).bg, badgeClasses(truck.status).text]">
                {{ truck.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openModal(truck)" class="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors">
                <Edit2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeModal()"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative z-10 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Editar Camión' : 'Registrar Nuevo Camión' }}</h3>
          <button @click="closeModal()" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitForm" class="p-6 space-y-4">
          <div v-if="formError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" /> {{ formError }}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
            <input 
              v-model="form.license_plate" 
              type="text" 
              required 
              :disabled="isEditing"
              class="block w-full border border-gray-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
              placeholder="AB-1234 o ABCD-12" 
            />
            <p v-if="isEditing" class="text-xs text-gray-400 mt-1">La patente es un identificador único y no se puede modificar.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <input v-model="form.model" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Volvo FH16" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad (Tons)</label>
              <input v-model.number="form.capacity" type="number" step="0.1" min="0" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="10.5" />
            </div>
            <div v-if="isEditing">
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.status" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="disponible">Disponible</option>
                <option value="en ruta">En Ruta</option>
                <option value="en taller">En Taller</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isEditing ? 'Guardar Cambios' : 'Registrar Camión' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { Truck, Edit2, Plus, AlertTriangle, X, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const trucks = ref<any[]>([])
const isLoading = ref(true)
const error = ref('')

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formError = ref('')

const form = ref({
  id: '',
  license_plate: '',
  model: '',
  capacity: 0,
  status: 'disponible'
})

const fetchTrucks = async () => {
  try {
    isLoading.value = true
    const { data, error: supaError } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (supaError) throw supaError
    trucks.value = data || []
  } catch (err: any) {
    error.value = 'Error cargando los vehículos: ' + (err.message || '')
  } finally {
    isLoading.value = false
  }
}

const goToTruck = (licensePlate: string) => {
  router.push({ name: 'truck-360', params: { licensePlate } })
}

const openModal = (truck: any = null) => {
  formError.value = ''
  if (truck) {
    isEditing.value = true
    form.value = { 
      id: truck.id,
      license_plate: truck.license_plate,
      model: truck.model,
      capacity: truck.capacity || 0,
      status: truck.status
    }
  } else {
    isEditing.value = false
    form.value = {
      id: '',
      license_plate: '',
      model: '',
      capacity: 0,
      status: 'disponible' // Implicit standard for new creations
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  formError.value = ''
  
  let formattedPlate = form.value.license_plate.toUpperCase().replace(/[\s-]/g, '')
  
  if (formattedPlate.length === 6) {
    if (/^[A-Z]{2}[0-9]{4}$/.test(formattedPlate)) {
      formattedPlate = formattedPlate.substring(0, 2) + '-' + formattedPlate.substring(2)
    } else if (/^[BCDFGHJKLPRSTVWXYZ]{4}[0-9]{2}$/.test(formattedPlate)) {
      formattedPlate = formattedPlate.substring(0, 4) + '-' + formattedPlate.substring(4)
    }
  }

  // Old format: AA-1111 (2 letters, 4 numbers)
  // New format: BBBB-11 (4 consonants excluding M, N, Ñ, Q, and vowels)
  const isOldFormat = /^[A-Z]{2}-[0-9]{4}$/.test(formattedPlate);
  const isNewFormat = /^[BCDFGHJKLPRSTVWXYZ]{4}-[0-9]{2}$/.test(formattedPlate);

  if (!isOldFormat && !isNewFormat) {
    formError.value = 'Formato inválido. Las patentes nuevas no pueden contener vocales ni M, N, Ñ, Q (Ej: BBCL-12 o AB-1234).'
    return
  }

  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      // Update existing
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          model: form.value.model.trim(),
          capacity: form.value.capacity,
          status: form.value.status
        })
        .eq('id', form.value.id)
        
      if (updateError) throw updateError
      
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('vehicles')
        .insert({
          license_plate: formattedPlate,
          model: form.value.model.trim(),
          capacity: form.value.capacity,
          // status triggers default 'disponible' in DB level but we can send it explicitly
          status: 'disponible'
        })
        
      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Ya existe un vehículo registrado con esa patente.')
        }
        throw insertError
      }
    }
    
    // Success
    closeModal()
    await fetchTrucks() // refresh list
    
  } catch (err: any) {
    formError.value = err.message || 'Error al guardar la información del vehículo'
  } finally {
    isSubmitting.value = false
  }
}

const badgeClasses = (status: string) => {
  switch (status) {
    case 'disponible': return { bg: 'bg-green-100', text: 'text-green-800' }
    case 'en ruta': return { bg: 'bg-blue-100', text: 'text-blue-800' }
    case 'en taller': return { bg: 'bg-red-100', text: 'text-red-800' }
    case 'inactivo': return { bg: 'bg-gray-100', text: 'text-gray-800' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-800' }
  }
}

onMounted(() => {
  fetchTrucks()
})
</script>
