import { ref } from 'vue'
import { account } from '@/services/appwrite'

export function useForgotPassword() {
  const loading = ref(false)
  const error = ref(null)
  // True once the request was sent — the view uses it to show the confirmation message
  const sent = ref(false)

  // Asks Appwrite to email a password-reset link to the given address
  async function sendResetLink(email) {
    loading.value = true
    error.value = null
    sent.value = false

    try {
      // The link in the email opens /reset-password?userId=...&secret=...
      // window.location.origin keeps this working on localhost and after deployment
      await account.createRecovery(email, `${window.location.origin}/reset-password`)
      sent.value = true
      return true
    } catch (err) {
      // Unknown emails (404) are treated the same as success, so nobody can use this
      // form to find out which emails are registered. Other errors (e.g. 400 for a host
      // missing from Appwrite Platforms) are real problems and must stay visible.
      if (err.code === 404) {
        sent.value = true
        return true
      }
      console.error('Forgot password error:', err)
      error.value = 'Could not send the reset link. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { sendResetLink, loading, error, sent }
}
