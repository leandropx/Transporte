<template>
  <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
    <!-- Mobile Menu Button (placeholder) -->
    <button class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none">
      <Menu class="h-6 w-6" />
    </button>
    
    <div class="flex-1 flex justify-end">
      <!-- User Menu -->
      <div class="ml-4 flex items-center md:ml-6 gap-4">
        <span class="text-sm font-medium text-gray-700 hidden sm:block">
          {{ authStore.user?.email }}
        </span>
        <button @click="handleLogout" class="p-2 text-gray-400 hover:text-brand-600 transition-colors rounded-full hover:bg-gray-100" title="Cerrar Sesión">
          <LogOut class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LogOut, Menu } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error cerrando sesión:', error)
  }
}
</script>
