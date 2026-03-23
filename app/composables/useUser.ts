import { userService, type UserProfile } from '~/services/user.service'

export const useUser = () => {
  const user = useState<UserProfile | null>('current_user', () => null)
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

  return { user, loading, fetchUser }
}
