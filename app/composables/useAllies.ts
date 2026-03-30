// composables/useAllies.ts
import { ref, computed } from 'vue'
import {
  useAllyService,
  type AllyRequest,
  type UserSummary,
  type AllySuggestion,
  type AllyStatusResult,
  type AllyRelationStatus,
} from '~/services/ally.service'
import { type BrokerDto } from '~/services/user.service'

export const useAllies = () => {
  const service = useAllyService()

  // ─── Estado: lista de aliados ─────────────────────────────────────────────
  const allies = ref<UserSummary[]>([])
  const alliesByUserId = ref<BrokerDto[]>([])
  const alliesTotal = ref(0)
  const alliesPage = ref(1)
  const alliesLimit = ref(20)
  const alliesTotalPages = ref(0)
  const alliesSearch = ref('')
  const alliesLoading = ref(false)
  const alliesError = ref<string | null>(null)

  const fetchAllies = async () => {
    alliesLoading.value = true
    alliesError.value = null
    try {
      const res = await service.getAllies({
        page: alliesPage.value,
        limit: alliesLimit.value,
        search: alliesSearch.value || undefined,
      })
      allies.value = res.data
      alliesTotal.value = res.total
      alliesTotalPages.value = res.totalPages
    } catch (e: any) {
      alliesError.value = e?.data?.message || 'Error al cargar aliados.'
    } finally {
      alliesLoading.value = false
    }
  }

  const fetchAlliesByUserId = async (userId: number) => {
    alliesLoading.value = true
    alliesError.value = null
    try {
      alliesByUserId.value = await service.getAlliesByUserId(userId)
    } catch (e: any) {
      alliesError.value = e?.data?.message || 'Error al cargar aliados.'
    }
    finally {
      alliesLoading.value = false
    }
  }

  const setAlliesPage = (p: number) => {
    alliesPage.value = p
    fetchAllies()
  }

  const applyAlliesSearch = (q: string) => {
    alliesSearch.value = q
    alliesPage.value = 1
    fetchAllies()
  }

  // ─── Estado: solicitudes recibidas ───────────────────────────────────────
  const pendingReceived = ref<AllyRequest[]>([])
  const receivedLoading = ref(false)

  const fetchPendingReceived = async () => {
    receivedLoading.value = true
    try {
      pendingReceived.value = await service.getPendingReceived()
    } catch {
      pendingReceived.value = []
    } finally {
      receivedLoading.value = false
    }
  }

  // ─── Estado: solicitudes enviadas ────────────────────────────────────────
  const pendingSent = ref<AllyRequest[]>([])
  const sentLoading = ref(false)

  const fetchPendingSent = async () => {
    sentLoading.value = true
    try {
      pendingSent.value = await service.getPendingSent()
    } finally {
      sentLoading.value = false
    }
  }

  // ─── Estado: sugerencias ─────────────────────────────────────────────────
  const suggestions = ref<AllySuggestion[]>([])
  const suggestionsTotal = ref(0)
  const suggestionsPage = ref(1)
  const suggestionsTotalPages = ref(0)
  const suggestionsLoading = ref(false)

  const fetchSuggestions = async () => {
    suggestionsLoading.value = true
    try {
      const res = await service.getSuggestions({
        page: suggestionsPage.value,
        limit: 8,
      })
      suggestions.value = res.data
      suggestionsTotal.value = res.total
      suggestionsTotalPages.value = res.totalPages
    } finally {
      suggestionsLoading.value = false
    }
  }

  // ─── Acciones ─────────────────────────────────────────────────────────────
  const respondRequest = async (
    requestId: number,
    status: 'accepted' | 'rejected',
  ) => {
    await service.respondRequest(requestId, status)
    // Refrescamos recibidas y aliados
    await Promise.all([fetchPendingReceived(), fetchAllies()])
  }

  const cancelRequest = async (requestId: number) => {
    await service.cancelRequest(requestId)
    await fetchPendingSent()
  }

  const removeAlly = async (allyId: number) => {
    await service.removeAlly(allyId)
    await fetchAllies()
  }

  // ─── Bulk status (para lista de brokers) ─────────────────────────────────
  const bulkStatus = ref<Record<number, AllyStatusResult>>({})
  const bulkLoading = ref(false)

  const loadBulkStatus = async (userIds: number[]) => {
    if (!userIds.length) return
    bulkLoading.value = true
    try {
      bulkStatus.value = await service.getStatusBulk(userIds)
    } finally {
      bulkLoading.value = false
    }
  }

  const getStatusFor = (userId: number): AllyStatusResult =>
    bulkStatus.value[userId] ?? { status: 'none' }

  // ─── Computed helpers ─────────────────────────────────────────────────────
  const pendingReceivedCount = computed(() => pendingReceived.value.length)
  const pendingSentCount = computed(() => pendingSent.value.length)
  const hasAlliesHasPrevPage = computed(() => alliesPage.value > 1)
  const alliesHasNextPage = computed(
    () => alliesPage.value < alliesTotalPages.value,
  )

  return {
    // Aliados
    allies,
    alliesTotal,
    alliesPage,
    alliesTotalPages,
    alliesSearch,
    alliesLoading,
    alliesError,
    fetchAllies,
    setAlliesPage,
    applyAlliesSearch,
    hasAlliesHasPrevPage,
    alliesHasNextPage,
      fetchAlliesByUserId,
      alliesByUserId,

    // Solicitudes recibidas
    pendingReceived,
    receivedLoading,
    pendingReceivedCount,
    fetchPendingReceived,

    // Solicitudes enviadas
    pendingSent,
    sentLoading,
    pendingSentCount,
    fetchPendingSent,

    // Sugerencias
    suggestions,
    suggestionsTotal,
    suggestionsPage,
    suggestionsTotalPages,
    suggestionsLoading,
    fetchSuggestions,

    // Acciones
    respondRequest,
    cancelRequest,
    removeAlly,

    // Bulk status
    bulkStatus,
    bulkLoading,
    loadBulkStatus,
    getStatusFor,
  }
}