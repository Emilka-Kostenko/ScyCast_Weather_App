import { ref } from 'vue'
import { account } from '@/services/appwrite'

// Lets the logged-in user change THEIR OWN password in Appwrite Auth.
// The call acts on the current session, so no admin rights or API key are needed.
// (Email is intentionally not changeable by users.)
export function useUpdateAccount() {
  const loading = ref(false)
  const error = ref(null)

  // Changes the password — Appwrite requires the current password as proof
  async function changePassword(currentPassword, newPassword) {
    loading.value = true
    error.value = null

    try {
      await account.updatePassword({ password: newPassword, oldPassword: currentPassword })
      return true
    } catch (err) {
      console.error('Change password error:', err)
      if (err.code === 401) {
        error.value = 'Current password is incorrect.'
      } else if (err.code === 400) {
        // Appwrite's own message explains what is wrong (too short, too common, etc.)
        error.value = err.message || 'Please choose a different password.'
      } else {
        error.value = 'Could not change the password. Please try again.'
      }
      return false
    } finally {
      loading.value = false
    }
  }

  return { changePassword, loading, error }
}
