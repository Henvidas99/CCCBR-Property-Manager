import { useApi } from '../composables/useApi'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: number
  fullName: string
  photo: string
  email: string
  lastSeenAt: string | null
}

export interface ChatMember {
  id: string
  userId: number
  chatId: string
  role: 'admin' | 'member'
  joinedAt: string
  hasLeft: boolean
  isMuted: boolean
  user: ChatUser
}

export interface MessageAttachment {
  id: string
  url: string
  type: 'image' | 'video'
  size: number
  originalName: string
  mimeType: string
}

export interface ChatMessage {
  id: string
  content: string | null
  senderId: number
  chatId: string
  replyToId: string | null
  replyTo?: ChatMessage | null
  sender: ChatUser
  attachments: MessageAttachment[]
  reads: { userId: number; readAt: string }[]
  isEdited: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Chat {
  id: string
  name: string | null
  description: string | null
  avatarUrl: string | null
  type: 'direct' | 'group'
  privacy: 'public' | 'private' | null
  isActive: boolean
  creatorId: number | null
  members: ChatMember[]
  lastMessage?: ChatMessage | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface DiscorableGroupDto {
  id: string
  name: string
  description: string | null
  avatarUrl: string | null
  privacy: 'public' | 'private'
  memberCount: number
}

export interface JoinRequest {
  id: string
  chatId: string
  userId: number
  status: 'pending' | 'accepted' | 'rejected'
  reviewedById: number | null
  reviewedAt: string | null
  user: ChatUser
  reviewedBy?: ChatUser | null
  createdAt: string
}

export interface PaginatedMessages {
  messages: ChatMessage[]
  nextCursor: string | null
  hasMore: boolean
}

export interface UnreadCounts {
  [chatId: string]: number
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const chatService = {
  // Chats
  async getMyChats(): Promise<Chat[]> {
    const { request } = useApi()
    return request<Chat[]>('/chats')
  },

  async getDiscoverableGroups(): Promise<DiscorableGroupDto[]> {
    const { request } = useApi()
    return request<DiscorableGroupDto[]>('/chats/discover')
  },

  async createDirectChat(targetUserId: number): Promise<Chat> {
    const { request } = useApi()
    return request<Chat>('/chats/direct', {
      method: 'POST',
      body: { targetUserId },
    })
  },

  async createGroup(data: {
    name: string
    description?: string
    privacy: 'public' | 'private'
    memberIds?: number[]
  }): Promise<Chat> {
    const { request } = useApi()
    return request<Chat>('/chats/groups', {
      method: 'POST',
      body: data,
    })
  },

  async getChatById(chatId: string): Promise<Chat> {
    const { request } = useApi()
    return request<Chat>(`/chats/${chatId}`)
  },

  async updateGroup(chatId: string, data: { name?: string; description?: string; privacy?: 'public' | 'private' }): Promise<Chat> {
    const { request } = useApi()
    return request<Chat>(`/chats/${chatId}`, {
      method: 'PATCH',
      body: data,
    })
  },

  async updateGroupAvatar(chatId: string, file: File): Promise<Chat> {
    const { request } = useApi()
    const formData = new FormData()
    formData.append('avatar', file)
    return request<Chat>(`/chats/${chatId}/avatar`, {
      method: 'POST',
      body: formData,
    })
  },

  async getOnlineUsers(): Promise<{ onlineUsers: number[] }> {
    const { request } = useApi()
    return request<{ onlineUsers: number[] }>('/chats/online/users')
  },

  async isUserOnline(userId: number): Promise<{ userId: number; isOnline: boolean }> {
    const { request } = useApi()
    return request<{ userId: number; isOnline: boolean }>(`/chats/online/${userId}`)
  },

  async getAllUnreadCounts(): Promise<UnreadCounts> {
    const { request } = useApi()
    return request<UnreadCounts>('/chats/unread/all')
  },

  // Members
  async addMembers(chatId: string, userIds: number[]): Promise<{ success: boolean }> {
    const { request } = useApi()
    return request<{ success: boolean }>(`/chats/${chatId}/members`, {
      method: 'POST',
      body: { userIds },
    })
  },

  async removeMember(chatId: string, userId: number): Promise<{ success: boolean }> {
    const { request } = useApi()
    return request<{ success: boolean }>(`/chats/${chatId}/members/${userId}`, {
      method: 'DELETE',
    })
  },

  async leaveGroup(chatId: string): Promise<{ success: boolean }> {
    const { request } = useApi()
    return request<{ success: boolean }>(`/chats/${chatId}/leave`, {
      method: 'POST',
    })
  },

  async setAdmin(chatId: string, userId: number): Promise<{ success: boolean }> {
    const { request } = useApi()
    return request<{ success: boolean }>(`/chats/${chatId}/members/${userId}/role`, {
      method: 'PATCH',
      body: { userId },
    })
  },

  async demoteAdmin(chatId: string, userId: number): Promise<{ success: boolean }> {
    const { request } = useApi()
    return request<{ success: boolean }>(`/chats/${chatId}/members/${userId}/demote`, {
      method: 'PATCH',
    })
  },

  // Join requests
  async joinPublicGroup(chatId: string): Promise<void> {
    const { request } = useApi()
    return request<void>(`/chats/${chatId}/join`, { method: 'POST' })
  },

  async requestJoinPrivateGroup(chatId: string): Promise<JoinRequest> {
    const { request } = useApi()
    return request<JoinRequest>(`/chats/${chatId}/request-join`, { method: 'POST' })
  },

  async getPendingRequests(chatId: string): Promise<JoinRequest[]> {
    const { request } = useApi()
    return request<JoinRequest[]>(`/chats/${chatId}/join-requests`)
  },

  async respondJoinRequest(chatId: string, requestId: string, status: 'accepted' | 'rejected'): Promise<JoinRequest> {
    const { request } = useApi()
    return request<JoinRequest>(`/chats/${chatId}/join-requests/${requestId}`, {
      method: 'PATCH',
      body: { status },
    })
  },

  // Messages
  async getMessages(chatId: string, cursor?: string, limit = 30): Promise<PaginatedMessages> {
    const { request } = useApi()
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    return request<PaginatedMessages>(`/chats/${chatId}/messages?${params}`)
  },

  async sendMessage(chatId: string, data: {
    content?: string
    replyToId?: string
    files?: File[]
  }): Promise<ChatMessage> {
    const { request } = useApi()
    const formData = new FormData()
    if (data.content) formData.append('content', data.content)
    if (data.replyToId) formData.append('replyToId', data.replyToId)
    if (data.files) data.files.forEach(f => formData.append('files', f))
    return request<ChatMessage>(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: formData,
    })
  },

  async editMessage(chatId: string, messageId: string, content: string): Promise<ChatMessage> {
    const { request } = useApi()
    return request<ChatMessage>(`/chats/${chatId}/messages/${messageId}`, {
      method: 'PATCH',
      body: { content },
    })
  },

  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    const { request } = useApi()
    return request<void>(`/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' })
  },
}