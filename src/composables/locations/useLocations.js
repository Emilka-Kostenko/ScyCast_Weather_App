import { ref } from 'vue'
import { databases, DATABASE_ID, LOCATIONS_COLLECTION_ID } from '@/services/appwrite'
import { Query } from 'appwrite'

export function useLocations() {
  const locations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Fetches all saved locations belonging to the given user
  async function fetchLocations(userId) {
    loading.value = true
    error.value = null

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LOCATIONS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      )
      locations.value = response.documents
    } catch (err) {
      error.value = 'Could not load your saved locations. Please try again.'
      locations.value = []
    } finally {
      loading.value = false
    }
  }

  return { locations, loading, error, fetchLocations }
}
