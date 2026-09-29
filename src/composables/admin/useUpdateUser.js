import { ref } from 'vue'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

export function useUpdateUser() {
  const loading = ref(false)
  const error = ref(null)

  const { isAdmin } = useCurrentUser()

  // Updates a single field (role or status) on a user document by its Appwrite $id
  // Only proceeds if the current session belongs to an admin
  async function updateUser(documentId, fields) {
    // Guard: reject if caller isn't an admin
    if (!isAdmin.value) {
      error.value = 'Unauthorized: admin access required.'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        fields // e.g. { role: 'admin' } or { status: 'suspended' }
      )
      return true
    } catch (err) {
      error.value = 'Could not update user. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, updateUser }
}
