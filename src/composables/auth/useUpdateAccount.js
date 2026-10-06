import { ref } from 'vue'
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import { useCurrentUser } from './useCurrentUser'

// Lets the logged-in user change THEIR OWN password and email in Appwrite Auth.
// Both calls act on the current session, so no admin rights or API key are needed.
export function useUpdateAccount() {
  const loading = ref(false)
  const error = ref(null)

  const { currentUser } = useCurrentUser()

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

  // Changes the login email — Appwrite requires the current password as proof
  async function changeEmail(newEmail, currentPassword) {
    loading.value = true
    error.value = null

    try {
      // Step 1: Auth first — if this fails, nothing else has changed yet
      await account.updateEmail({ email: newEmail, password: currentPassword })
    } catch (err) {
      console.error('Change email error:', err)
      if (err.code === 401) {
        error.value = 'Current password is incorrect.'
      } else if (err.code === 409) {
        error.value = 'This email is already used by another account.'
      } else {
        error.value = 'Could not change the email. Please try again.'
      }
      loading.value = false
      return false
    }

    try {
      // Step 2: keep the users collection in sync with the new login email
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.value.$id,
        { email: newEmail }
      )
      // Reflect the change in the shared user object so the UI updates immediately
      currentUser.value.email = newEmail
      return true
    } catch (err) {
      console.error('Email saved in Auth but profile sync failed:', err)
      // The login email IS already changed — tell the user so they don't retry blindly
      error.value = 'Your login email was changed, but your profile could not be updated. Please sign in again.'
      return false
    } finally {
      loading.value = false
    }
  }

  return { changePassword, changeEmail, loading, error }
}
