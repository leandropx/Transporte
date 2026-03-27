<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users class="h-8 w-8 text-brand-600" /> Directorio de Conductores
        </h1>
        <p class="text-gray-500 mt-1">Alta, edición y búsqueda del personal operativo.</p>
      </div>
      <button 
        @click="openModal()"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors shrink-0"
      >
        <UserPlus class="h-5 w-5 mr-2" /> Agregar Conductor
      </button>
    </div>

    <!-- Buscador Local -->
    <div class="mb-6 relative max-w-md">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="h-5 w-5 text-gray-400" />
      </div>
      <input
        v-model="workerStore.searchQuery"
        type="text"
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
        placeholder="Filtrar por nombre, RUT o licencia..."
      />
    </div>

    <!-- Loading State -->
    <div v-if="workerStore.isLoading" class="animate-pulse space-y-4">
      <div v-for="i in 5" :key="i" class="h-16 bg-white rounded-xl shadow-sm border border-gray-100"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="workerStore.error" class="bg-red-50 p-4 border border-red-200 rounded-xl text-red-600">
      <AlertTriangle class="h-5 w-5 inline mr-2" /> {{ workerStore.error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="workerStore.workers.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Users class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay conductores registrados</h3>
      <p class="text-sm text-gray-500 mt-1">Registra al primer trabajador para comenzar a asignar rutas.</p>
    </div>

    <!-- No Results found on search -->
    <div v-else-if="workerStore.filteredWorkers.length === 0" class="glass-panel rounded-3xl p-12 text-center">
      <Search class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900">No hay coincidencias</h3>
      <p class="text-sm text-gray-500 mt-1">No se encontraron conductores para la búsqueda "{{ workerStore.searchQuery }}".</p>
    </div>

    <!-- Data Table -->
    <div v-else>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RUT</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencia</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="worker in workerStore.filteredWorkers" :key="worker.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div v-if="worker.profile_picture_url" class="flex-shrink-0 h-10 w-10">
                    <img :src="worker.profile_picture_url" alt="" class="h-10 w-10 rounded-full object-cover">
                  </div>
                  <div v-else class="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                    {{ worker.full_name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-bold text-gray-900">{{ worker.full_name }}</div>
                    <div class="text-xs text-gray-500">ID: {{ worker.id?.split('-')[0] }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-700 font-mono">{{ formatRut(worker.rut) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Clase {{ worker.license_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', badgeClasses(worker.status).bg, badgeClasses(worker.status).text]">
                  {{ translateStatus(worker.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button @click="openModal(worker)" class="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors" title="Editar">
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button @click="handleDelete(worker)" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Eliminar">
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
        :current-page="workerStore.currentPage"
        :total-pages="workerStore.totalPages"
        :total-count="workerStore.totalCount"
        :page-size="25"
        @page-change="workerStore.fetchWorkers($event)"
      />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeModal()"></div>
      
      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ isEditing ? 'Editar Conductor' : 'Registrar Conductor' }}</h3>
          <button @click="closeModal()" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitForm" class="p-6 space-y-4 overflow-y-auto">
          <div v-if="formError" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 border border-red-100">
            <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" /> {{ formError }}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
            <input v-model="form.full_name" type="text" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-brand-500 focus:border-brand-500" placeholder="Ej: Juan Pérez González" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
            <input 
              v-model="form.rut" 
              type="text" 
              required 
              :disabled="isEditing"
              @input="onRutInput"
              class="block w-full border border-gray-300 rounded-lg px-3 py-2 font-mono uppercase focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" 
              placeholder="12.345.678-9" 
            />
            <p v-if="isEditing" class="text-xs text-gray-400 mt-1">El RUT es inmodificable.</p>
          </div>

          <!-- Campos de Contacto -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input v-model="form.phone" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="form.email" type="email" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="correo@ejemplo.com" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input v-model="form.address" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Calle, Número, Comuna" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergencia</label>
              <input v-model="form.emergency_contact" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="Nombre contacto" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono Emergencia</label>
              <input v-model="form.emergency_phone" type="text" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500" placeholder="+56 9 1234 5678" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Licencia *</label>
              <select v-model="form.license_type" required class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="A2">A2</option>
                <option value="A4">A4 (Carga Simple)</option>
                <option value="A5">A5 (Carga Articulada)</option>
                <option value="B">B</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select v-model="form.status" class="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-brand-500 focus:border-brand-500">
                <option value="activo">Activo</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="licencia_medica">Licencia Médica</option>
                <option value="desvinculado">Desvinculado</option>
              </select>
            </div>
          </div>

          <!-- Archivos Adjuntos y Foto -->
          <div class="border-t border-gray-100 pt-4 mt-2 space-y-4">
            
            <!-- Foto de perfil -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon class="w-4 h-4 text-gray-500" /> Foto de Perfil
              </h4>
              <div class="flex items-center gap-4">
                <img v-if="form.profile_picture_url || previewProfilePic" :src="previewProfilePic || form.profile_picture_url" class="h-16 w-16 rounded-full object-cover border" />
                <div v-else class="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <User class="w-8 h-8"/>
                </div>
                <label class="cursor-pointer px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                  <span v-if="profilePicFile">Cambiar Archivo ({{ profilePicFile.name }})</span>
                  <span v-else>Seleccionar Foto</span>
                  <input type="file" class="hidden" @change="handleProfilePicChange" accept="image/*" />
                </label>
              </div>
            </div>

            <!-- Documentos -->
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Paperclip class="w-4 h-4 text-gray-500" /> Documentos Adjuntos
              </h4>
              
              <ul v-if="form.documents.length > 0" class="mb-2 space-y-2">
                <li v-for="(doc, idx) in form.documents" :key="idx" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <a :href="doc.url" target="_blank" class="text-xs text-brand-600 hover:underline truncate mr-2">{{ doc.name }}</a>
                  <button type="button" @click="removeExistingDocument(idx)" class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar archivo">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </li>
              </ul>

              <ul v-if="selectedDocuments.length > 0" class="mb-2 space-y-2">
                <li v-for="(f, idx) in selectedDocuments" :key="'new-'+idx" class="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span class="text-xs text-blue-800 truncate mr-2">{{ f.name }} (Pendiente)</span>
                  <button type="button" @click="removeDocSelection(idx)" class="text-blue-400 hover:text-red-500 transition-colors p-1">
                    <X class="w-4 h-4" />
                  </button>
                </li>
              </ul>

              <label class="mt-2 flex justify-center w-full h-16 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-brand-400 focus:outline-none">
                  <span class="flex items-center space-x-2">
                      <Upload class="w-5 h-5 text-gray-400" />
                      <span class="text-xs font-medium text-gray-600">Adjuntar archivos (PDF, DOC, JPG)</span>
                  </span>
                  <input type="file" multiple class="hidden" @change="handleDocsChange" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
              </label>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="closeModal()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" :disabled="isSubmitting" class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 border border-transparent rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-70">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
              {{ isEditing ? 'Guardar Cambios' : 'Registrar Conductor' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWorkersStore } from '@/stores/workers'
import { uploadFile, deleteFile } from '@/services/storage'
import { useToast } from '@/composables/useToast'
import { formatRut, cleanRut, isValidRut, getErrorMessage } from '@/utils/formatters'
import { Users, UserPlus, Edit2, AlertTriangle, X, Loader2, Search, Paperclip, Upload, Trash2, Image as ImageIcon, User } from 'lucide-vue-next'
import PaginationControls from '@/components/PaginationControls.vue'
import type { AttachedDocument } from '@/types/models'

const workerStore = useWorkersStore()
const toast = useToast()

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formError = ref('')
const profilePicFile = ref<File | null>(null)
const previewProfilePic = ref<string>('')
const selectedDocuments = ref<File[]>([])

const form = ref({
  id: '',
  rut: '',
  full_name: '',
  phone: '',
  email: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
  profile_picture_url: '',
  documents: [] as AttachedDocument[],
  license_type: 'A5',
  status: 'activo'
})

const handleProfilePicChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if(target.files && target.files.length > 0) {
    profilePicFile.value = target.files[0]
    previewProfilePic.value = URL.createObjectURL(target.files[0])
  }
}

const handleDocsChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if(target.files) {
    for(let i=0; i<target.files.length; i++) {
        selectedDocuments.value.push(target.files[i])
    }
  }
}

const removeDocSelection = (idx: number) => {
  selectedDocuments.value.splice(idx, 1)
}

const removeExistingDocument = async (docIndex: number) => {
  if (!confirm('¿Seguro de eliminar este documento?')) return
  try {
     const doc = form.value.documents[docIndex]
     await deleteFile('fleet_assets', doc.path)
     form.value.documents.splice(docIndex, 1)
     if(isEditing.value) {
       await workerStore.updateWorker(form.value.id, { documents: form.value.documents })
     }
     toast.success('Documento eliminado correctamente')
  } catch(e: unknown) {
     formError.value = 'No se pudo eliminar el archivo. ' + getErrorMessage(e)
  }
}

const handleDelete = async (worker: { id: string; full_name: string }) => {
  if (!confirm(`¿Estás seguro de eliminar al conductor ${worker.full_name}? Esta acción es irreversible.`)) return
  try {
    await workerStore.deleteWorker(worker.id)
    toast.success(`Conductor ${worker.full_name} eliminado correctamente`)
  } catch (err: unknown) {
    toast.error('Error al eliminar: ' + getErrorMessage(err))
  }
}

const openModal = (worker: any = null) => {
  formError.value = ''
  profilePicFile.value = null
  previewProfilePic.value = ''
  selectedDocuments.value = []
  
  if (worker) {
    isEditing.value = true
    form.value = { 
      id: worker.id,
      rut: worker.rut,
      full_name: worker.full_name,
      phone: worker.phone || '',
      email: worker.email || '',
      address: worker.address || '',
      emergency_contact: worker.emergency_contact || '',
      emergency_phone: worker.emergency_phone || '',
      profile_picture_url: worker.profile_picture_url || '',
      documents: worker.documents ? [...worker.documents] : [],
      license_type: worker.license_type,
      status: worker.status
    }
  } else {
    isEditing.value = false
    form.value = {
      id: '',
      rut: '',
      full_name: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      emergency_phone: '',
      profile_picture_url: '',
      documents: [],
      license_type: 'A5',
      status: 'activo'
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const onRutInput = (e: Event) => {
  form.value.rut = formatRut((e.target as HTMLInputElement).value)
}

const submitForm = async () => {
  formError.value = ''
  
  if (!isEditing.value && !isValidRut(form.value.rut)) {
    formError.value = 'El RUT ingresado no es válido.'
    return
  }

  isSubmitting.value = true
  
  try {
    const rawRut = cleanRut(form.value.rut)
    
    // Subir foto de perfil
    if (profilePicFile.value) {
      const picPath = `workers/${rawRut}/profile_${Date.now()}_${profilePicFile.value.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const picUrl = await uploadFile('fleet_assets', picPath, profilePicFile.value)
      form.value.profile_picture_url = picUrl
    }

    // Subir documentos
    for(const file of selectedDocuments.value) {
      const path = `workers/${rawRut}/docs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const url = await uploadFile('fleet_assets', path, file)
      form.value.documents.push({ name: file.name, url, path })
    }

    const payload = {
        full_name: form.value.full_name.trim(),
        phone: form.value.phone.trim(),
        email: form.value.email.trim(),
        address: form.value.address.trim(),
        emergency_contact: form.value.emergency_contact.trim(),
        emergency_phone: form.value.emergency_phone.trim(),
        profile_picture_url: form.value.profile_picture_url,
        documents: form.value.documents,
        license_type: form.value.license_type,
        status: form.value.status
    }

    if (isEditing.value) {
      await workerStore.updateWorker(form.value.id, payload as any)
      toast.success('Conductor actualizado correctamente')
    } else {
      await workerStore.createWorker({
        rut: rawRut,
        ...payload
      } as any)
      toast.success('Conductor registrado correctamente')
    }
    
    closeModal()
  } catch (err: unknown) {
    formError.value = getErrorMessage(err) || 'Error al guardar el perfil del conductor'
  } finally {
    isSubmitting.value = false
  }
}

const translateStatus = (status: string) => {
  switch (status) {
    case 'activo': return 'Activo'
    case 'vacaciones': return 'Vacaciones'
    case 'licencia_medica': return 'Licencia Médica'
    case 'desvinculado': return 'Desvinculado'
    default: return status
  }
}

const badgeClasses = (status: string) => {
  switch (status) {
    case 'activo': return { bg: 'bg-green-100', text: 'text-green-800' }
    case 'vacaciones': return { bg: 'bg-blue-100', text: 'text-blue-800' }
    case 'licencia_medica': return { bg: 'bg-orange-100', text: 'text-orange-800' }
    case 'desvinculado': return { bg: 'bg-red-100', text: 'text-red-800' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-800' }
  }
}

onMounted(() => {
  workerStore.fetchWorkers()
})
</script>
