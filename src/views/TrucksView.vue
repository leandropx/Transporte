<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Truck class="h-8 w-8 text-brand-600" /> Directorio de Camiones
        </h1>
        <p class="text-gray-500 mt-1">Alta, edición y búsqueda de la flota de vehículos.</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors shrink-0"
      >
        <Plus class="h-5 w-5 mr-2" /> Agregar Camión
      </button>
    </div>

    <!-- Buscador Local -->
    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="h-5 w-5 text-gray-400" />
      </div>
      <input
        v-model="truckStore.searchQuery"
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
        placeholder="Filtrar por patente, modelo o estado..."
      />
    </div>

    <!-- Loading State -->
    <div v-if="truckStore.isLoading" class="animate-pulse space-y-4">
      <div v-for="i in 5" :key="i" class="h-16 bg-white rounded-xl shadow-sm border border-gray-100"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="truckStore.error" class="bg-red-50 p-4 border border-red-200 rounded-xl text-red-600">
      <AlertTriangle class="h-5 w-5 inline mr-2" /> {{ truckStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="truckStore.trucks.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Truck class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay camiones registrados</h3>
      <p class="text-sm text-gray-500 mt-1">Registra tu primer vehículo para comenzar la gestión.</p>
    </div>
    
    <!-- No Results found on search -->
    <div v-else-if="truckStore.filteredTrucks.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Search class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay coincidencias</h3>
      <p class="text-sm text-gray-500 mt-1">No se encontraron camiones para la búsqueda "{{ truckStore.searchQuery }}".</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
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
            <tr v-for="truck in truckStore.filteredTrucks" :key="truck.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold border font-mono tracking-wider cursor-pointer hover:bg-gray-100 transition"
                      @click="goToTruck(truck.license_plate)"
                      :class="['bg-gray-50 text-gray-800 border-gray-200 hover:text-brand-600 hover:border-brand-200']">
                  {{ formatLicensePlate(truck.license_plate) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ truck.brand ? `${truck.brand} ${truck.model}` : truck.model }}</div>
                <div class="text-xs text-gray-500">Capacidad: {{ truck.capacity }} tons</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', badgeClasses(truck.status).bg, badgeClasses(truck.status).text]">
                  {{ truck.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openModal(truck)" class="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors" title="Editar">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(truck)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Eliminar">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
      <!-- Paginación -->
      <PaginationControls
        :current-page="truckStore.currentPage"
        :total-pages="truckStore.totalPages"
        :total-count="truckStore.totalCount"
        :page-size="25"
        @page-change="truckStore.fetchTrucks($event)"
      />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeModal()"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Editar Camión' : 'Registrar Nuevo Camión' }}</h3>
          <button @click="closeModal()" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitForm" class="p-6 space-y-4 overflow-y-auto">
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
              placeholder="AB·12·34 o BB·CL·12" 
            />
            <p v-if="isEditing" class="text-xs text-gray-400 mt-1">La patente es un identificador único y no se puede modificar.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
            <input v-model="form.model" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Volvo FH16" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input v-model="form.brand" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Volvo" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
              <input v-model.number="form.year_model" type="number" min="1980" :max="new Date().getFullYear() + 1" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="2024" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
              <input v-model.number="form.mileage" type="number" min="0" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: 150000" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Capacidad (Tons)</label>
              <input v-model.number="form.capacity" type="number" step="0.1" min="0" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="10.5" />
            </div>
            <div v-if="isEditing" class="col-span-2 sm:col-span-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.status" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="disponible">Disponible</option>
                <option value="en ruta">En Ruta</option>
                <option value="en taller">En Taller</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <!-- Componente para adjuntar documentos -->
          <div class="border-t border-gray-100 pt-4 mt-2">
            <h4 class="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Paperclip class="w-4 h-4 text-gray-500" /> Documentos Adjuntos
            </h4>
            
            <div v-if="fileError" class="mb-3 text-xs text-red-600 font-medium">{{ fileError }}</div>
            
            <ul v-if="form.documents.length > 0" class="mb-3 space-y-2">
              <li v-for="(doc, idx) in form.documents" :key="idx" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                <a :href="doc.url" target="_blank" class="text-xs text-brand-600 hover:underline truncate mr-2">{{ doc.name }}</a>
                <button type="button" @click="removeExistingDocument(idx)" class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar archivo">
                  <Trash2 class="w-4 h-4" />
                </button>
              </li>
            </ul>

            <ul v-if="selectedFiles.length > 0" class="mb-3 space-y-2">
              <li v-for="(f, idx) in selectedFiles" :key="'new-'+idx" class="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                <span class="text-xs text-blue-800 truncate mr-2">{{ f.name }} (Pendiente)</span>
                <button type="button" @click="removeFileSelection(idx)" class="text-blue-400 hover:text-red-500 transition-colors p-1">
                  <X class="w-4 h-4" />
                </button>
              </li>
            </ul>

            <label class="mt-2 flex justify-center w-full h-24 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-brand-400 focus:outline-none">
                <span class="flex items-center space-x-2">
                    <Upload class="w-5 h-5 text-gray-400" />
                    <span class="text-sm font-medium text-gray-600">Haz clic para adjuntar archivos</span>
                </span>
                <input type="file" multiple class="hidden" @change="handleFileChange" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </label>
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
import { useTrucksStore } from '@/stores/trucks'
import { uploadFile, deleteFile } from '@/services/storage'
import { useToast } from '@/composables/useToast'
import { formatLicensePlate, cleanLicensePlate, isValidLicensePlate, getErrorMessage } from '@/utils/formatters'
import { Truck, Edit2, Plus, AlertTriangle, X, Loader2, Search, Paperclip, Upload, Trash2 } from 'lucide-vue-next'
import PaginationControls from '@/components/PaginationControls.vue'
import type { AttachedDocument } from '@/types/models'

const router = useRouter()
const truckStore = useTrucksStore()
const toast = useToast()

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const fileError = ref('')
const selectedFiles = ref<File[]>([])

const form = ref({
  id: '',
  license_plate: '',
  brand: '',
  model: '',
  year_model: new Date().getFullYear(),
  mileage: 0,
  capacity: 0,
  status: 'disponible',
  documents: [] as AttachedDocument[]
})

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if(target.files) {
    for(let i=0; i<target.files.length; i++) {
        selectedFiles.value.push(target.files[i])
    }
  }
}

const removeFileSelection = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const removeExistingDocument = async (docIndex: number) => {
  if (!confirm('¿Estás seguro de eliminar este documento de forma permanente?')) return
  fileError.value = ''
  try {
     const doc = form.value.documents[docIndex]
     await deleteFile('fleet_assets', doc.path)
     form.value.documents.splice(docIndex, 1)
     if(isEditing.value) {
       await truckStore.updateTruck(form.value.id, { documents: form.value.documents })
     }
     toast.success('Documento eliminado correctamente')
  } catch(e: unknown) {
     fileError.value = 'No se pudo eliminar el archivo. ' + getErrorMessage(e)
  }
}

const goToTruck = (licensePlate: string) => {
  router.push({ name: 'truck-360', params: { licensePlate } })
}

const handleDelete = async (truck: { id: string; license_plate: string }) => {
  if (!confirm(`¿Estás seguro de eliminar el camión ${formatLicensePlate(truck.license_plate)}? Esta acción es irreversible.`)) return
  try {
    await truckStore.deleteTruck(truck.id)
    toast.success(`Camión ${formatLicensePlate(truck.license_plate)} eliminado correctamente`)
  } catch (err: unknown) {
    toast.error('Error al eliminar: ' + getErrorMessage(err))
  }
}

const openModal = (truck: any = null) => {
  formError.value = ''
  fileError.value = ''
  selectedFiles.value = []
  if (truck) {
    isEditing.value = true
    form.value = { 
      id: truck.id,
      license_plate: truck.license_plate,
      brand: truck.brand || '',
      model: truck.model,
      year_model: truck.year_model || new Date().getFullYear(),
      mileage: truck.mileage || 0,
      capacity: truck.capacity || 0,
      status: truck.status,
      documents: truck.documents ? [...truck.documents] : []
    }
  } else {
    isEditing.value = false
    form.value = {
      id: '',
      license_plate: '',
      brand: '',
      model: '',
      year_model: new Date().getFullYear(),
      mileage: 0,
      capacity: 0,
      status: 'disponible',
      documents: []
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const submitForm = async () => {
  formError.value = ''
  
  const formattedPlate = formatLicensePlate(form.value.license_plate)
  const cleanPlate = cleanLicensePlate(form.value.license_plate)

  if (!isValidLicensePlate(cleanPlate)) {
    formError.value = 'Formato inválido. La patente debe tener 6 caracteres alfanuméricos (Ej: AB·12·34).'
    return
  }

  isSubmitting.value = true
  fileError.value = ''
  
  try {
    // Upload files if any
    for(const file of selectedFiles.value) {
      const path = `vehicles/${formattedPlate}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const url = await uploadFile('fleet_assets', path, file)
      form.value.documents.push({ name: file.name, url, path })
    }

    const payload = {
      model: form.value.model.trim(),
      brand: form.value.brand.trim(),
      year_model: form.value.year_model,
      mileage: form.value.mileage,
      capacity: form.value.capacity,
      status: form.value.status as any,
      documents: form.value.documents
    }

    if (isEditing.value) {
      await truckStore.updateTruck(form.value.id, payload)
      toast.success('Camión actualizado correctamente')
    } else {
      await truckStore.createTruck({
        license_plate: formattedPlate,
        ...payload
      } as any)
      toast.success('Camión registrado correctamente')
    }
    
    closeModal()
  } catch (err: unknown) {
    formError.value = getErrorMessage(err) || 'Error al guardar la información del vehículo'
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
  truckStore.fetchTrucks()
})
</script>
