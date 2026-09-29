import { ref } from 'vue'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  const { isAdmin } = useCurrentUser()

  // Fetches all user documents from the users collection
  // Only proceeds if the current session belongs to an admin
  async function fetchUsers() {
    // Guard: reject the call entirely if the caller isn't an admin
    if (!isAdmin.value) {
      error.value = 'Unauthorized: admin access required.'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      )
      users.value = response.documents
    } catch (err) {
      error.value = 'Could not load users. Please try again.'
      users.value = []
    } finally {
      loading.value = false
    }
  }

  return { users, loading, error, fetchUsers }
}
