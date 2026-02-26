export const useApi = () => {
    const config = useRuntimeConfig()

    const request = async <T>(
        url: string,
        options: Parameters<typeof $fetch>[1] = {}
    ): Promise<T> => {
        return await $fetch<T>(url, {
            baseURL: config.public.apiBase,
            credentials: 'include',
            ...options
        })
    }

    return { request }
}