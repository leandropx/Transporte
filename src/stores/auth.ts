import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { getErrorMessage } from '@/utils/formatters'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  const initializeAuth = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      
      session.value = data.session
      user.value = data.session?.user || null
      
      supabase.auth.onAuthStateChange((event, _session) => {
        session.value = _session
        user.value = _session?.user || null

        // P4 #20: Manejar expiración de sesión
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT') {
            user.value = null
            session.value = null
          }
        }
      })
    } catch (err: unknown) {
      console.error('Error initializing auth:', getErrorMessage(err))
    } finally {
      loading.value = false
    }
  }

  const signOut = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      session.value = null
    } catch (err: unknown) {
      console.error('Error signing out:', getErrorMessage(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  return { 
    user, 
    session, 
    loading, 
    isAuthenticated,
    initializeAuth, 
    signOut 
  }
})
