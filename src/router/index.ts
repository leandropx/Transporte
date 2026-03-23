import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/truck/:licensePlate',
      name: 'truck-360',
      component: () => import('@/views/Truck360View.vue'),
      props: true
    },
    {
      path: '/routes',
      name: 'routes',
      component: () => import('@/views/RoutesView.vue')
    },
    {
      path: '/maintenance',
      name: 'maintenance',
      component: () => import('@/views/MaintenanceView.vue')
    }
  ]
})

export default router
