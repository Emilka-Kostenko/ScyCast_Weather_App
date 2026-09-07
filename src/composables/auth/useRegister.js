import { ref } from 'vue'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { ID, Permission, Role } from 'appwrite'
import { useCurrentUser } from './useCurrentUser'

export function useRegister() {
  const loading = ref(false)
  const error = ref(null)

  // We only need fetchCurrentUser here — not the full login flow,
  // which also updates lastLogin and expects a users doc to already exist
  const { fetchCurrentUser } = useCurrentUser()

  async function register(name, age, email, password) {
    loading.value = true
    error.value = null

    try {
      // Step 1: Create the Appwrite Auth account (no session yet)
      const authUser = await account.create(ID.unique(), email, password, name)

      // Step 2: Clear any leftover session before creating a fresh one
      // (a botched previous registration attempt may have left a session open)
      try { await account.deleteSession('current') } catch { /* no session — fine */ }
      await account.createEmailPasswordSession(email, password)

      // Step 3: Create the matching document in the users collection
      // This requires an active session (step 2) + collection-level Create permission
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: authUser.$id,
          name,
          email,
          age: Number(age),
          role: 'user',
          status: 'active',
        },
        [
          // Only this user can read and update their own document
          Permission.read(Role.user(authUser.$id)),
          Permission.update(Role.user(authUser.$id)),
        ]
      )

      // Step 4: Populate the shared currentUser ref so the router guard
      // immediately knows the user's role and status after redirect
      await fetchCurrentUser()

      return { success: true }
    } catch (err) {
      console.error('Registration error:', err)
      if (err.code === 409) {
        error.value = 'An account with this email already exists.'
      } else {
        error.value = 'Registration failed. Please try again.'
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { register, loading, error }
}
