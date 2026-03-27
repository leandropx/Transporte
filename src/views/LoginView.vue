<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-lg font-medium text-gray-900">Iniciar Sesión</h3>
      <p class="mt-1 text-sm text-gray-500">Sistema registro transportes</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div v-if="errorMsg" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">{{ errorMsg }}</div>
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
        <div class="mt-1">
          <input id="email" v-model="email" type="email" required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="admin@empresa.com" />
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
        <div class="mt-1">
          <input id="password" v-model="password" type="password" required
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="••••••••" />
        </div>
      </div>

      <div>
        <button type="submit" :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50">
          <span v-if="loading">Cargando...</span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/services/supabase'
import { getErrorMessage } from '@/utils/formatters'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error
    
    router.push('/')
  } catch (err: unknown) {
    errorMsg.value = getErrorMessage(err) || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>
