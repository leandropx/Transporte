<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[99] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300',
            typeClasses[toast.type]
          ]"
        >
          <component :is="typeIcons[toast.type]" class="w-5 h-5 shrink-0 mt-0.5" />
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            @click="remove(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import type { ToastType } from '@/composables/useToast'

const { toasts, remove } = useToast()

const typeClasses: Record<ToastType, string> = {
  success: 'bg-green-50/90 border-green-200 text-green-800',
  error: 'bg-red-50/90 border-red-200 text-red-800',
  info: 'bg-blue-50/90 border-blue-200 text-blue-800',
  warning: 'bg-amber-50/90 border-amber-200 text-amber-800'
}

const typeIcons: Record<ToastType, any> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
