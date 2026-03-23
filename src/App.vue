<template>
  <div v-if="!authStore.loading">
    <component :is="layoutComponent" />
  </div>
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/layout/MainLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initializeAuth()
})

const layoutComponent = computed(() => {
  if (route.meta.layout === 'auth') {
    return AuthLayout
  }
  return MainLayout
})
</script>

<style>
/* Solo estilos globales base si aplica */
</style>
