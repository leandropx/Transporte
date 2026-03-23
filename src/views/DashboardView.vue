<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
        Gestión de Flotas Simplificada
      </h1>
      <p class="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
        Busca tu camión, monitorea rutas y administra mantenciones en un solo lugar.
      </p>
    </div>
    
    <div class="max-w-2xl mx-auto relative z-10">
      <GlobalSearch size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalSearch from '@/components/GlobalSearch.vue'
</script>
