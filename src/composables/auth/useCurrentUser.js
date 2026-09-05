import { ref, computed } from 'vue'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { Query } from 'appwrite'

// Defined outside the function so the same ref is shared across all components
// that call useCurrentUser() — one user object for the whole app
const currentUser = ref(null)

export function useCurrentUser() {
  // True if the logged-in user has the admin role
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  // True if the user is active (not suspended)
  const isActive = computed(() => currentUser.value?.status === 'active')

  // Called once on app start (in App.vue)
  // Checks if Appwrite has an active session, then loads the user's profile from the users table
  async function fetchCurrentUser() {
    try {
      // Ask Appwrite Auth if someone is already logged in
      const authUser = await account.get()

      // Use the auth user's ID to find their profile document in the users table
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', authUser.$id)]
      )

      // Store the full profile (name, role, status, etc.) in the shared ref
      if (response.documents.length > 0) {
        currentUser.value = response.documents[0]
      }
    } catch {
      // No active session — user is not logged in
      currentUser.value = null
    }
  }

  return { currentUser, isAdmin, isActive, fetchCurrentUser }
}
