<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

const router = useRouter()
const { currentUser, fetchCurrentUser } = useCurrentUser()

// On every page load, check if an Appwrite session already exists
// and populate currentUser before the router guard runs
onMounted(async () => {
  await fetchCurrentUser()

  // After we know the user's state, trigger the router to re-evaluate the current route
  // This ensures the guard runs with the correct currentUser value
  router.replace(router.currentRoute.value.fullPath)
})
</script>

<template>
  <!-- RouterView renders whichever view matches the current URL -->
  <RouterView />
</template>
