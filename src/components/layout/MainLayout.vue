<template>
  <div class="h-screen w-full flex bg-gray-50 overflow-hidden">
    <!-- Overlay for mobile -->
    <div 
      v-if="isMobileMenuOpen" 
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity md:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <Sidebar :is-open="isMobileMenuOpen" @close="isMobileMenuOpen = false" />

    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Topbar -->
      <Topbar @toggle-menu="isMobileMenuOpen = !isMobileMenuOpen" />

      <!-- Main Content Area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pb-10">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const isMobileMenuOpen = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
