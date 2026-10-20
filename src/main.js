import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

// Restore the session BEFORE the router starts its first navigation.
// Otherwise the guard sees currentUser = null on every page refresh
// and sends a logged-in user to /login. The Appwrite session itself lives
// in the browser and is only deleted by an explicit logout.
async function start() {
  const { fetchCurrentUser } = useCurrentUser()
  await fetchCurrentUser()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

start()
