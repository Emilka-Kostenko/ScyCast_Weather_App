import { account } from '@/services/appwrite'
import { useCurrentUser } from './useCurrentUser'

export function useLogout() {
  const { currentUser } = useCurrentUser()

  async function logout() {
    // Delete the active Appwrite session so the user is logged out on the backend
    await account.deleteSession('current')

    // Clear the shared currentUser ref so the whole app knows nobody is logged in
    currentUser.value = null
  }

  return { logout }
}
