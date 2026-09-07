import { createRouter, createWebHistory } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // Redirect root to /weather — the guard will handle unauthenticated users
      redirect: '/weather',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/AuthView.vue'), //lazy load the component
      meta: { public: true },
    },
    {
      path: '/weather',
      name: 'weather',
      component: () => import('@/views/WeatherView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/suspended',
      name: 'suspended',
      component: () => import('@/views/SuspendedView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Navigation guard — runs before every route change
router.beforeEach((to) => {
  const { currentUser } = useCurrentUser()
  const user = currentUser.value

  // If the route requires auth and no one is logged in → go to login
  if (to.meta.requiresAuth && !user) {
    return { name: 'login' }
  }

  // If logged in and trying to reach the login page → redirect based on role
  if (to.meta.public && user) {
    return user.role === 'admin' ? { name: 'admin-users' } : { name: 'weather' }
  }

  // If suspended user tries to go anywhere except /suspended → block them
  if (user && user.status === 'suspended' && to.name !== 'suspended') {
    return { name: 'suspended' }
  }

  // If active user or admin tries to access /suspended → send them home
  if (user && user.status === 'active' && to.name === 'suspended') {
    return user.role === 'admin' ? { name: 'admin-users' } : { name: 'weather' }
  }

  // If a non-admin tries to reach an admin route → redirect to weather
  if (to.meta.requiresAdmin && user?.role !== 'admin') {
    return { name: 'weather' }
  }
})

export default router
