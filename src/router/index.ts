import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { layout: 'auth', requiresUnauth: true }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/trucks',
      name: 'trucks',
      component: () => import('@/views/TrucksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/workers',
      name: 'workers',
      component: () => import('@/views/WorkersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/truck/:licensePlate',
      name: 'truck-360',
      component: () => import('@/views/Truck360View.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('@/views/RoutesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('@/views/MaintenanceView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation Guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresUnauth = to.matched.some(record => record.meta.requiresUnauth)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresUnauth && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
