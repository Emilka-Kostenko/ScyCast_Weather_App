import { ref } from 'vue'
import { account } from '@/services/appwrite'

export function useResetPassword() {
  const loading = ref(false)
  const error = ref(null)

  // Sets a new password using the userId + secret from the link in the recovery email
  async function resetPassword(userId, secret, newPassword) {
    loading.value = true
    error.value = null

    try {
      await account.updateRecovery({ userId, secret, password: newPassword })
      return true
    } catch (err) {
      console.error('Reset password error:', err)
      // 401 = the link is expired (valid for 1 hour) or was already used
      if (err.code === 401) {
        error.value = 'This reset link is invalid or has expired. Please request a new one.'
      } else if (err.code === 400) {
        // Appwrite's own message explains what is wrong with the password
        error.value = err.message || 'Please choose a different password.'
      } else {
        error.value = 'Could not reset the password. Please try again.'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  return { resetPassword, loading, error }
}
