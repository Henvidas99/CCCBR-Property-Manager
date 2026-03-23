const TOKEN_KEY = 'auth_token'

export const useAuth = () => {
  const token = useState<string | null>(TOKEN_KEY, () => {
    if (import.meta.client) {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  })

  const setToken = (newToken: string) => {
    token.value = newToken
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, newToken)
    }
  }

  const clearToken = () => {
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const isAuthenticated = computed(() => !!token.value)

  return { token, setToken, clearToken, isAuthenticated }
}
