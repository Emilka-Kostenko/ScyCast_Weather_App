import { ref } from 'vue'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { useCurrentUser } from './useCurrentUser'
import { Query } from 'appwrite'

export function useLogin() {
  const loading = ref(false)
  const error = ref(null)

  const { fetchCurrentUser } = useCurrentUser()

  async function login(email, password) {
    loading.value = true
    error.value = null

    try {
      // Create an Appwrite auth session with email and password
      await account.createEmailPasswordSession(email, password)

      // Load the user's profile into the shared currentUser ref
      await fetchCurrentUser()

      // Get the auth user's ID to find their document in the users table
      const authUser = await account.get()

      // Update lastLogin timestamp so admin can see when this user last signed in
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', authUser.$id)]
      )

      if (response.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          response.documents[0].$id,
          { lastLogin: new Date().toISOString() }
        )
      }

      return { success: true }
    } catch (err) {
      // Show a friendly error message instead of Appwrite's raw error
      error.value = 'Invalid email or password. Please try again.'
      return { success: false }
    } finally {
      // Always stop the loading spinner whether login succeeded or failed
      loading.value = false
    }
  }

  return { login, loading, error }
}
