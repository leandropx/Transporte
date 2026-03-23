<template>
  <div class="space-y-6">
    <div class="text-center">
      <h3 class="text-lg font-medium text-gray-900">Crear una cuenta</h3>
      <p class="mt-1 text-sm text-gray-500">Regístrate para empezar a gestionar tu flota.</p>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div v-if="errorMsg" class="rounded-md bg-red-50 p-4">
        <div class="text-sm text-red-700">{{ errorMsg }}</div>
      </div>
      
      <div v-if="successMsg" class="rounded-md bg-green-50 p-4">
        <div class="text-sm text-green-700">{{ successMsg }}</div>
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
          <input id="password" v-model="password" type="password" required minlength="6"
            class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="••••••••" />
        </div>
      </div>

      <div>
        <button type="submit" :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50">
          <span v-if="loading">Cargando...</span>
          <span v-else>Registrarse</span>
        </button>
      </div>
    </form>
    
    <div class="text-center text-sm">
      <p class="text-gray-600">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="font-medium text-brand-600 hover:text-brand-500">
          Inicia sesión aquí
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleRegister = async () => {
  try {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''
    
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (error) throw error
    
    successMsg.value = 'Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta o inicia sesión si no configuraste la confirmación.'
    email.value = ''
    password.value = ''
  } catch (error: any) {
    errorMsg.value = error.message || 'Error al registrarse'
  } finally {
    loading.value = false
  }
}
</script>
