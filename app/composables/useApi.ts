export const useApi = () => {
    const config = useRuntimeConfig()
    const { token } = useAuth()

    const request = async <T>(
        url: string,
        options: Parameters<typeof $fetch>[1] = {}
    ): Promise<T> => {
        const headers: Record<string, string> = {}
        if (token.value) {
            headers['Authorization'] = `Bearer ${token.value}`
        }
        return await $fetch<T>(url, {
            baseURL: config.public.apiBase,
            credentials: 'include',
            headers,
            ...options
        })
    }

    return { request }
}