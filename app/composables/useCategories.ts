import type { ApiCategory } from '~/types'

export const useCategories = () => {
  const config = useRuntimeConfig()
  const categories = ref<ApiCategory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiCategory[]>(`${config.public.apiBase}/Category/get-all`)
      categories.value = response
    } catch {
      error.value = 'Error al cargar las categorías'
    } finally {
      loading.value = false
    }
  }

  return {
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),
    fetchCategories,
  }
}
