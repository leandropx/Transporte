<template>
  <div class="w-full relative">
    <form @submit.prevent="handleSearch" class="relative group mt-4">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search class="h-6 w-6 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
      </div>
      <input
        v-model="query"
        type="text"
        :class="[
          'block w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm',
          size === 'large' ? 'text-xl' : 'text-base'
        ]"
        placeholder="Ingresa la patente (Ej: AB-1234)"
        autocomplete="off"
        :disabled="isSearching"
      />
      
      <div class="absolute inset-y-0 right-2 flex items-center">
        <button
          type="submit"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!query.trim() || isSearching"
        >
          <Loader2 v-if="isSearching" class="animate-spin h-5 w-5" />
          <span v-else>Buscar</span>
        </button>
      </div>
    </form>
    
    <!-- Inline error message for dashboard context -->
    <div v-if="localError" class="mt-3 text-red-500 text-sm flex items-center bg-red-50 p-3 rounded-lg border border-red-100">
      <AlertCircle class="w-4 h-4 mr-2" />
      {{ localError }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loader2, AlertCircle } from 'lucide-vue-next'

const props = defineProps({
  size: {
    type: String,
    default: 'regular' // 'regular' o 'large'
  }
})

const query = ref('')
const isSearching = ref(false)
const localError = ref('')
const router = useRouter()

const handleSearch = () => {
  const plate = query.value.trim().toUpperCase()
  if (!plate) return
  
  isSearching.value = true
  localError.value = ''
  
  // Navigate directly to Truck360 view. The view will handle fetching and states.
  router.push({ name: 'truck-360', params: { licensePlate: plate } })
}
</script>
