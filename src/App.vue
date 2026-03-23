<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Truck class="h-6 w-6 text-brand-600" />
          <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-900">
            FleetMaster
          </span>
        </div>
        
        <nav class="hidden md:flex space-x-8">
          <router-link to="/" class="text-gray-600 hover:text-brand-600 font-medium transition-colors" active-class="text-brand-600">Dashboard</router-link>
          <router-link to="/routes" class="text-gray-600 hover:text-brand-600 font-medium transition-colors" active-class="text-brand-600">Rutas</router-link>
          <router-link to="/maintenance" class="text-gray-600 hover:text-brand-600 font-medium transition-colors" active-class="text-brand-600">Mantenciones</router-link>
        </nav>
      </div>
    </header>

    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Truck } from 'lucide-vue-next'
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
