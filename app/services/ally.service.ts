// services/ally.service.ts
import { useApi } from '../composables/useApi'
import type { BrokerDto } from './user.service'
export type AllyRelationStatus =
  | 'ally'
  | 'request_sent'
  | 'request_received'
  | 'none'

export interface AllyStatusResult {
  status: AllyRelationStatus
  requestId?: number
}

export interface AllyRequest {
  id: number
  requesterId: number
  receiverId: number
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message: string | null
  createdAt: string
  updatedAt: string
  requester?: UserSummary
  receiver?: UserSummary
}

export interface UserSummary {
  id: number
  fullName: string
  photo: string
  email: string
  position: string | null
  username: string | null
}

export interface PaginatedAllies {
  data: UserSummary[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AllySuggestion extends UserSummary {
  mutualCount: number
}

export interface PaginatedSuggestions {
  data: AllySuggestion[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MutualAlliesResult {
  mutual: UserSummary[]
  count: number
}

// ─── Factory ──────────────────────────────────────────────────────────────────
export const useAllyService = () => {
  const { request } = useApi()

  // Enviar solicitud de alianza
  const sendRequest = (receiverId: number, message?: string) =>
    request<AllyRequest>('/allies/request', {
      method: 'POST',
      body: { receiverId, message },
    })

  // Responder solicitud
  const respondRequest = (
    requestId: number,
    status: 'accepted' | 'rejected',
  ) =>
    request<AllyRequest>(`/allies/request/${requestId}/respond`, {
      method: 'PATCH',
      body: { status },
    })

  // Cancelar solicitud enviada
  const cancelRequest = (requestId: number) =>
    request<{ message: string }>(`/allies/request/${requestId}/cancel`, {
      method: 'DELETE',
    })

  // Eliminar aliado
  const removeAlly = (allyId: number) =>
    request<{ message: string }>(`/allies/${allyId}`, { method: 'DELETE' })

  // Lista de aliados paginada
  const getAllies = (params: {
    page?: number
    limit?: number
    search?: string
  }) =>
    request<PaginatedAllies>('/allies', {
      method: 'GET',
      params,
    })

  // Solicitudes recibidas pendientes
  const getPendingReceived = () =>
    request<AllyRequest[]>('/allies/requests/received')

  // Solicitudes enviadas pendientes
  const getPendingSent = () =>
    request<AllyRequest[]>('/allies/requests/sent')

  // Historial completo
  const getHistory = () =>
    request<AllyRequest[]>('/allies/requests/history')

  // Contador público de aliados
  const getAlliesCount = (userId: number) =>
    request<{ userId: number; count: number }>(`/allies/count/${userId}`)

  // Aliados en común con otro usuario
  const getMutualAllies = (targetUserId: number) =>
    request<MutualAlliesResult>(`/allies/mutual/${targetUserId}`)

  // Sugerencias paginadas
  const getSuggestions = (params?: { page?: number; limit?: number }) =>
    request<PaginatedSuggestions>('/allies/suggestions', {
      method: 'GET',
      params,
    })

  // Estado con un usuario específico
  const getStatusWith = (targetUserId: number) =>
    request<AllyStatusResult>(`/allies/status/${targetUserId}`)

  // Estado en bulk para lista de usuarios
  const getStatusBulk = (userIds: number[]) =>
    request<Record<number, AllyStatusResult>>('/allies/status/bulk', {
      method: 'POST',
      body: { userIds },
    })

    const getAlliesByUserId = (userId: number) =>
      request<BrokerDto[]>(`/allies/userId/${userId}`)


  return {
    sendRequest,
    respondRequest,
    cancelRequest,
    removeAlly,
    getAllies,
    getPendingReceived,
    getPendingSent,
    getHistory,
    getAlliesCount,
    getMutualAllies,
    getSuggestions,
    getStatusWith,
    getStatusBulk,
    getAlliesByUserId,
  }
}