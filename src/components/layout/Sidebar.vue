<template>
  <aside class="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
    <!-- Logo -->
    <div class="h-16 flex items-center px-6 border-b border-gray-200">
      <Truck class="h-6 w-6 text-brand-600 mr-2" />
      <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-900">
        FleetMaster
      </span>
    </div>
    <!-- Navigation -->
    <nav class="flex-1 px-4 py-4 space-y-1">
      <router-link v-for="item in navigation" :key="item.name" :to="item.href"
        class="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-colors"
        active-class="bg-brand-50 text-brand-600">
        <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
        {{ item.name }}
      </router-link>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { Truck, LayoutDashboard, Users, Map, PenTool } from 'lucide-vue-next'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Camiones', href: '/trucks', icon: Truck },
  { name: 'Conductores', href: '/workers', icon: Users },
  { name: 'Rutas', href: '/routes', icon: Map },
  { name: 'Mantenciones', href: '/maintenance', icon: PenTool },
]
</script>
