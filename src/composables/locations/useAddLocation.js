import { ref } from 'vue'
import { databases, DATABASE_ID, LOCATIONS_COLLECTION_ID } from '@/services/appwrite'
import { ID, Permission, Role } from 'appwrite'

export function useAddLocation() {
  const loading = ref(false)
  const error = ref(null)

  // Saves a new location to Appwrite for the given user.
  // data: { userId, label, lat, lon, isPrimary }
  async function addLocation(data) {
    loading.value = true
    error.value = null

    try {
      const document = await databases.createDocument(
        DATABASE_ID,
        LOCATIONS_COLLECTION_ID,
        ID.unique(),
        data,
        [
          // Only the owner can read, update, and delete their own location
          Permission.read(Role.user(data.userId)),
          Permission.update(Role.user(data.userId)),
          Permission.delete(Role.user(data.userId)),
        ]
      )
      return { success: true, document }
    } catch (err) {
      error.value = 'Could not save location. Please try again.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, addLocation }
}
