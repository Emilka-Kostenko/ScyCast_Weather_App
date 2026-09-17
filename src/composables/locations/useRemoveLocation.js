import { ref } from 'vue'
import { databases, DATABASE_ID, LOCATIONS_COLLECTION_ID } from '@/services/appwrite'

export function useRemoveLocation() {
  const loading = ref(false)
  const error = ref(null)

  // Deletes a saved location document by its Appwrite document ID
  async function removeLocation(documentId) {
    loading.value = true
    error.value = null

    try {
      await databases.deleteDocument(DATABASE_ID, LOCATIONS_COLLECTION_ID, documentId)
      return { success: true }
    } catch (err) {
      error.value = 'Could not remove location. Please try again.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, removeLocation }
}
