/**
 * Composable para notificaciones toast.
 * Provee un sistema centralizado de feedback visual al usuario.
 */
import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

const addToast = (message: string, type: ToastType = 'info', duration = 4000) => {
  const id = nextId++
  const toast: Toast = { id, message, type, duration }
  toasts.value.push(toast)

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error', 6000),
    info: (message: string) => addToast(message, 'info'),
    warning: (message: string) => addToast(message, 'warning', 5000),
    remove: removeToast
  }
}
