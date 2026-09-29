import { ref } from 'vue'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

export function useDeleteUser() {
  const loading = ref(false)
  const error = ref(null)

  const { isAdmin } = useCurrentUser()

  // Permanently deletes a user document from the users collection by its Appwrite $id
  // Only proceeds if the current session belongs to an admin
  async function deleteUser(documentId) {
    // Guard: reject if caller isn't an admin
    if (!isAdmin.value) {
      error.value = 'Unauthorized: admin access required.'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId
      )
      return true
    } catch (err) {
      error.value = 'Could not delete user. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, deleteUser }
}
