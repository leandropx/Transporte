<template>
  <div class="w-full relative" v-click-outside="closeDropdown">
    <form @submit.prevent="handleSearch" class="relative group mt-4">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search class="h-6 w-6 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
      </div>
      
      <input
        v-model="query"
        @input="onInput"
        @focus="isDropdownOpen = true"
        type="text"
        :class="[
          'block w-full pl-12 pr-20 py-4 bg-white border border-gray-200 rounded-2xl leading-5 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm relative z-10',
          size === 'large' ? 'text-xl' : 'text-base',
          isDropdownOpen && results.length > 0 ? 'rounded-b-none border-b-transparent' : ''
        ]"
        placeholder="Busca por patente, ruta, fecha o mantención..."
        autocomplete="off"
        :disabled="isSearching"
      />
      
      <div class="absolute inset-y-0 right-2 flex items-center z-10">
        <button
          v-if="query"
          type="button"
          @click="clearSearch"
          class="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <X class="w-5 h-5" />
        </button>
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
    
    <!-- Autocomplete Dropdown -->
    <div 
      v-show="isDropdownOpen && query.length >= 2"
      class="absolute left-0 right-0 w-full mt-0 bg-white border border-gray-200 border-t-0 rounded-b-2xl shadow-xl z-50 overflow-hidden"
    >
      <div v-if="localError" class="p-4 text-red-500 text-sm flex items-center bg-red-50">
        <AlertCircle class="w-4 h-4 mr-2" /> {{ localError }}
      </div>
      
      <div v-else-if="isSearching && results.length === 0" class="p-6 text-center text-gray-400">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-brand-500" />
        <p class="text-sm">Buscando flotas, rutas e historiales...</p>
      </div>
      
      <div v-else-if="results.length === 0 && !isSearching" class="p-6 text-center text-gray-500">
        <p class="text-sm font-medium">No hay coincidencias para "{{ query }}"</p>
        <p class="text-xs mt-1 text-gray-400">Intenta con otra patente, origen o estado.</p>
      </div>

      <ul v-else class="max-h-96 overflow-y-auto pt-2 pb-4">
        <!-- Render grouped results or simple list -->
        <li 
          v-for="item in results" 
          :key="`${item.type}-${item.id}`"
          @click="selectResult(item)"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group/item"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mt-0.5">
              <Truck v-if="item.type === 'vehicle'" class="w-5 h-5 text-brand-500" />
              <MapPin v-else-if="item.type === 'route'" class="w-5 h-5 text-blue-500" />
              <PenTool v-else-if="item.type === 'maintenance'" class="w-5 h-5 text-orange-500" />
            </div>
            <div class="ml-3 flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate group-hover/item:text-brand-600 transition-colors">
                {{ item.title }}
              </p>
              <p class="text-xs text-gray-500 truncate mt-0.5">
                {{ item.subtitle }}
              </p>
            </div>
            <div class="ml-2 flex-shrink-0">
              <span :class="[
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                item.type === 'vehicle' ? 'bg-brand-50 text-brand-700' :
                item.type === 'route' ? 'bg-blue-50 text-blue-700' :
                'bg-orange-50 text-orange-700'
              ]">
                {{ translateType(item.type) }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Loader2, AlertCircle, Truck, MapPin, PenTool, X } from 'lucide-vue-next'
import { useGlobalSearch, SearchResult } from '@/composables/useGlobalSearch'

const props = defineProps({
  size: {
    type: String,
    default: 'regular'
  }
})

const query = ref('')
const isDropdownOpen = ref(false)
const localError = ref('')
const router = useRouter()

const { results, isSearching, error, performSearch } = useGlobalSearch()

// Debounce logic for input
let timeout: any = null
const onInput = () => {
  isDropdownOpen.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    performSearch(query.value)
  }, 300) // 300ms debounce
}

const clearSearch = () => {
  query.value = ''
  results.value = []
  isDropdownOpen.value = false
}

// Custom directive for clicking outside the component
const vClickOutside = {
  mounted: (el: any, binding: any) => {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted: (el: any) => {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const selectResult = (item: SearchResult) => {
  closeDropdown()
  if (item.type === 'vehicle') {
    router.push({ name: 'truck-360', params: { licensePlate: item.id } })
  } else if (item.type === 'route') {
    // Navigates to route views or just redirects to dashboard filtering it
    router.push({ name: 'routes' })
  } else if (item.type === 'maintenance') {
    router.push({ name: 'maintenance' })
  }
}

// Fallback for enter key
const handleSearch = () => {
  if (results.value.length > 0) {
    // Submit the top matched vehicle if available
    const topVehicle = results.value.find(r => r.type === 'vehicle')
    if (topVehicle) {
      selectResult(topVehicle)
    }
  } else {
    // Just try routing with the query directly assuming it's a license plate
    const plate = query.value.trim().toUpperCase()
    if (plate) {
      router.push({ name: 'truck-360', params: { licensePlate: plate } })
      closeDropdown()
    }
  }
}

const translateType = (type: string) => {
  switch(type) {
    case 'vehicle': return 'Camión'
    case 'route': return 'Ruta'
    case 'maintenance': return 'Mantención'
    default: return type
  }
}
</script>
