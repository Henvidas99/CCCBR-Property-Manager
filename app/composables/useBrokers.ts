import { ref, computed } from 'vue'
import { userService, type BrokerDto, type BrokerDetailDto } from '~/services/user.service'

export function useBrokers() {
  const brokers = ref<BrokerDto[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const page = ref(1)
  const limit = ref(12)
  const search = ref('')

  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)

  async function fetchBrokers() {
    isLoading.value = true
    error.value = null
    try {
      const result = await userService.getAllBrokers(page.value, limit.value, search.value)
      brokers.value = result.users
      total.value = result.total
      totalPages.value = result.totalPages
    } catch (e: any) {
      error.value = e?.message || 'Error al cargar los asociados'
    } finally {
      isLoading.value = false
    }
  }

  async function nextPage() {
    if (hasNextPage.value) {
      page.value++
      await fetchBrokers()
    }
  }

  async function prevPage() {
    if (hasPrevPage.value) {
      page.value--
      await fetchBrokers()
    }
  }

  async function goToPage(p: number) {
    page.value = p
    await fetchBrokers()
  }

  async function applySearch(query: string) {
    search.value = query
    page.value = 1
    await fetchBrokers()
  }

  return {
    brokers,
    total,
    totalPages,
    isLoading,
    error,
    page,
    limit,
    search,
    hasNextPage,
    hasPrevPage,
    fetchBrokers,
    nextPage,
    prevPage,
    goToPage,
    applySearch,
  }
}

export function useBrokerDetail() {
  const broker = ref<BrokerDetailDto | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBroker(id: number) {
    isLoading.value = true
    error.value = null
    try {
      broker.value = await userService.getBrokerById(id)
    } catch (e: any) {
      error.value = e?.message || 'Error al cargar el asociado'
    } finally {
      isLoading.value = false
    }
  }

  return {
    broker,
    isLoading,
    error,
    fetchBroker,
  }
}