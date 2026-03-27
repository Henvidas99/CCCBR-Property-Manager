import { userService, type UserProfile } from '~/services/user.service'

export const useUser = () => {
  const user = useState<UserProfile | null>('current_user', () => null)
  const users = useState<UserProfile[]>('all_users', () => [])
  const loading = ref(false)

  const fetchUser = async () => {
    if (user.value) return
    loading.value = true
    try {
      user.value = await userService.getUser()
    } catch {
      user.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchAllUsers = async () => {
    loading.value = true
    try {
      users.value = await userService.getAllUsers()
    } catch {
      users.value = []
    } finally {
      loading.value = false
    }
  }

  return { user, loading, fetchUser, fetchAllUsers, users }
}
