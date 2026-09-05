import { ref } from 'vue'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { ID, Permission, Role } from 'appwrite'
import { useLogin } from './useLogin'

export function useRegister() {
  const loading = ref(false)
  const error = ref(null)

  const { login } = useLogin()

  async function register(name, age, email, password) {
    loading.value = true
    error.value = null

    try {
      // Step 1: Create the Appwrite Auth account (handles email + password only)
      const authUser = await account.create(ID.unique(), email, password, name)

      // Step 2: Create the matching document in the users table with app-specific data
      // Permissions ensure only this user and admins can read/update this document
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
          // Only this specific user can read and update their own document
          Permission.read(Role.user(authUser.$id)),
          Permission.update(Role.user(authUser.$id)),
          // Admins (label:admin) have full access via collection-level permissions
        ]
      )

      // Step 3: Automatically log in after successful registration
      await login(email, password)

      return { success: true }
    } catch (err) {
      // Handle the most common case: email already registered
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
