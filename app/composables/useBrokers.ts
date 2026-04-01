import { ref, computed } from 'vue'
import { userService, type BrokerDto, type BrokerDetailDto } from '~/services/user.service'
import { useAllyService, type AllyStatusResult } from '~/services/ally.service'

export function useBrokers() {
  const allyService = useAllyService()
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

  const allyStatusMap = ref<Record<number, AllyStatusResult>>({})

  async function fetchBrokers() {
    isLoading.value = true
    error.value = null
    try {
      const result = await userService.getAllBrokers(page.value, limit.value, search.value)
      brokers.value = result.users
      total.value = result.total
      totalPages.value = result.totalPages

      const ids = brokers.value.map(b => b.id)
      if(ids.length > 0) {
        var res = await allyService.getStatusBulk(ids)
        allyStatusMap.value = { ...allyStatusMap.value, ...res }
      }
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

  const refreshStatusFor = async (userId: number) => {
    const res = await allyService.getStatusBulk([userId])
    allyStatusMap.value = { ...allyStatusMap.value, ...res }
  }

  const getAllyStatus = (userId: number): AllyStatusResult => {
    return allyStatusMap.value[userId] ?? { status: 'none', requestId: undefined }
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
    getAllyStatus,
    refreshStatusFor,
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