import { ref } from 'vue'
import { functions, UPDATE_USER_AUTH_FUNCTION_ID } from '@/services/appwrite'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

export function useUpdateUserAuth() {
  const loading = ref(false)
  const error = ref(null)

  const { isAdmin } = useCurrentUser()

  // Calls the updateUserAuth Appwrite Function to change email and/or password
  // for any user — requires admin role and the target user's Auth userId
  async function updateUserAuth(userId, { email, password }) {
    if (!isAdmin.value) {
      error.value = 'Unauthorized: admin access required.'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await functions.createExecution(
        UPDATE_USER_AUTH_FUNCTION_ID,
        JSON.stringify({ userId, email, password }),
        false // synchronous execution — wait for the result
      )

      const response = JSON.parse(result.responseBody)

      if (!response.success) {
        error.value = response.message || 'Could not update user.'
        return false
      }

      return true
    } catch (err) {
      error.value = 'Function call failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { updateUserAuth, loading, error }
}
