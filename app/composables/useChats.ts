// composables/useChats.ts
import type { UUID } from 'node:crypto'
import { chatService, type Chat, type ChatMessage, type JoinRequest, type UnreadCounts } from '~/services/chat.service'
import { chatSocketService } from '~/services/chat.socket.service'


export type { Chat, ChatMessage, ChatMember, MessageAttachment, JoinRequest } from '~/services/chat.service'


const useChatsState = () => ({
  chats: useState<Chat[]>('chats_list', () => []),
  activeChat: useState<Chat | null>('chats_active', () => null),
  messages: useState<Record<string, ChatMessage[]>>('chats_messages', () => ({})),
  cursors: useState<Record<string, string | null>>('chats_cursors', () => ({})),
  hasMore: useState<Record<string, boolean>>('chats_has_more', () => ({})),
  unreadCounts: useState<UnreadCounts>('chats_unread', () => ({})),
  onlineUsers: useState<Set<number>>('chats_online', () => new Set()),
  typingUsers: useState<Record<string, number[]>>('chats_typing', () => ({})),
  loadingChats: useState<boolean>('chats_loading', () => false),
  loadingMessages: useState<boolean>('chats_loading_msgs', () => false),
  wsConnected: useState<boolean>('chats_ws', () => false),
})

export const useChats = () => {
  const state = useChatsState()
  const {
    chats, activeChat, messages, cursors, hasMore,
    unreadCounts, onlineUsers, typingUsers,
    loadingChats, loadingMessages, wsConnected,
  } = state

  // ─── Computed ───────────────────────────────────────────────────────────────

  const allChats = computed(() => chats.value)
  const groupChats = computed(() => chats.value.filter(c => c.type === 'group'))
  const directChats = computed(() => chats.value.filter(c => c.type === 'direct'))
  const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

  const activeChatMessages = computed(() =>
    activeChat.value ? (messages.value[activeChat.value.id] ?? []) : []
  )

  const activeChatTyping = computed(() =>
    activeChat.value ? (typingUsers.value[activeChat.value.id] ?? []) : []
  )

  // ─── WebSocket setup ────────────────────────────────────────────────────────

  function connectSocket(token: string) {
    if (chatSocketService.isConnected) return

    chatSocketService.connect(token, {
      onConnect: () => { wsConnected.value = true },
      onDisconnect: () => { wsConnected.value = false },

      // Nuevo mensaje → insertarlo en la lista y actualizar lastMessage del chat
      onNewMessage: (msg: ChatMessage) => {
        const chatMsgs = messages.value[msg.chatId] ?? []
        if (!chatMsgs.find(m => m.id === msg.id)) {
          messages.value = {
            ...messages.value,
            [msg.chatId]: [...chatMsgs, msg],
          }
        }
        // Actualizar lastMessage en la lista
        chats.value = chats.value.map(c =>
          c.id === msg.chatId ? { ...c, lastMessage: msg } : c
        )
      },

      onMessageEdited: (msg: ChatMessage) => {
        const chatMsgs = messages.value[msg.chatId] ?? []
        messages.value = {
          ...messages.value,
          [msg.chatId]: chatMsgs.map(m => m.id === msg.id ? msg : m),
        }
      },

      onMessageDeleted: ({ messageId, chatId }) => {
        const chatMsgs = messages.value[chatId] ?? []
        messages.value = {
          ...messages.value,
          [chatId]: chatMsgs.map(m =>
            m.id === messageId ? { ...m, deletedAt: new Date().toISOString() } : m
          ),
        }
      },

      onUserTyping: ({ chatId, userId }) => {
        const current = typingUsers.value[chatId] ?? []
        if (!current.includes(userId)) {
          typingUsers.value = { ...typingUsers.value, [chatId]: [...current, userId] }
        }
      },

      onUserStopTyping: ({ chatId, userId }) => {
        const current = typingUsers.value[chatId] ?? []
        typingUsers.value = {
          ...typingUsers.value,
          [chatId]: current.filter(id => id !== userId),
        }
      },

      onUserOnline: ({ userId }) => {
        const next = new Set(onlineUsers.value)
        next.add(Number(userId))
        onlineUsers.value = next
        // Actualizar estado online en chats directos
        chats.value = chats.value.map(c => {
          if (c.type === 'direct') {
            const hasUser = c.members.some(m => m.userId === Number(userId))
            return hasUser ? { ...c, _online: true } : c
          }
          return c
        })
      },

      onUserOffline: ({ userId }) => {
        const next = new Set(onlineUsers.value)
        next.delete(Number(userId))
        onlineUsers.value = next
      },

      onMessagesRead: ({ chatId, userId, messageIds }) => {
        const chatMsgs = messages.value[chatId] ?? []
        messages.value = {
          ...messages.value,
          [chatId]: chatMsgs.map(m =>
            messageIds.includes(m.id)
              ? { ...m, reads: [...(m.reads ?? []), { userId, readAt: new Date().toISOString() }] }
              : m
          ),
        }
      },

      onUnreadCountUpdate: ({ chatId, unreadCount }) => {
        unreadCounts.value = { ...unreadCounts.value, [chatId]: unreadCount }
        chats.value = chats.value.map(c =>
          c.id === chatId ? { ...c, unreadCount } : c
        )
      },

      onMemberAdded: ({ chatId, user }) => {
        if (activeChat.value?.id === chatId) {
          refreshChat(chatId)
        }
      },

      onMemberRemoved: ({ chatId, userId }) => {
        if (activeChat.value?.id === chatId) {
          refreshChat(chatId)
        }
      },

      onMemberLeft: ({ chatId, userId }) => {
        if (activeChat.value?.id === chatId) {
          refreshChat(chatId)
        }
      },

      onJoinRequestResponse: ({ chatId, status }) => {
        if (status === 'accepted') {
          // Refrescar lista de chats para incluir el nuevo grupo
          fetchChats()
        }
      },
    })
  }

  function disconnectSocket() {
    chatSocketService.disconnect()
    wsConnected.value = false
  }

  // ─── API calls ──────────────────────────────────────────────────────────────

  async function fetchChats() {
    loadingChats.value = true
    try {
      const result = await chatService.getMyChats()
      chats.value = result

      // Inicializar unread counts desde la respuesta
      const counts: UnreadCounts = {}
      result.forEach(c => { counts[c.id] = c.unreadCount })
      unreadCounts.value = counts
    } catch (e) {
      console.error('[useChats] fetchChats error', e)
    } finally {
      loadingChats.value = false
    }
  }

  async function fetchMessages(chatId: string, loadMore = false) {
    if (loadingMessages.value) return
    loadingMessages.value = true
    try {
      const cursor = loadMore ? (cursors.value[chatId] ?? undefined) : undefined
      if (loadMore && !hasMore.value[chatId]) return

      const result = await chatService.getMessages(chatId, cursor)

      const existing = loadMore ? (messages.value[chatId] ?? []) : []
      // loadMore = scroll hacia arriba → los nuevos mensajes van ANTES
      messages.value = {
        ...messages.value,
        [chatId]: loadMore ? [...result.messages, ...existing] : result.messages,
      }
      cursors.value = { ...cursors.value, [chatId]: result.nextCursor }
      hasMore.value = { ...hasMore.value, [chatId]: result.hasMore }
    } catch (e) {
      console.error('[useChats] fetchMessages error', e)
    } finally {
      loadingMessages.value = false
    }
  }

  async function selectChat(chat: Chat) {
    activeChat.value = chat

    // Cargar mensajes si no los tenemos aún
    if (!messages.value[chat.id]) {
      await fetchMessages(chat.id)
    }

    // Marcar como leídos
    const chatMsgs = messages.value[chat.id] ?? []
    const lastMsg = chatMsgs[chatMsgs.length - 1]
    if (lastMsg) {
      chatSocketService.markRead(chat.id, lastMsg.id)
      unreadCounts.value = { ...unreadCounts.value, [chat.id]: 0 }
      chats.value = chats.value.map(c =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    }

    chatSocketService.joinChat(chat.id)
  }

  async function sendMessage(chatId: string, content: string, files: File[] = [], replyToId?: string) {
    try {
      // Optimistic update — mensaje temporal mientras llega el WS
      const tempId = `temp_${Date.now()}`
      const tempMsg: ChatMessage = {
        id: tempId,
        content,
        senderId: 0, // se reemplaza cuando llega el evento WS
        chatId,
        replyToId: replyToId ?? null,
        replyTo: null,
        sender: { id: 0, fullName: 'Tú', photo: '', email: '' },
        attachments: [],
        reads: [],
        isEdited: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      messages.value = {
        ...messages.value,
        [chatId]: [...(messages.value[chatId] ?? []), tempMsg],
      }

      // Enviar al servidor (el evento WS new_message reemplazará el temp)
      await chatService.sendMessage(chatId, { content, replyToId, files })

      // Limpiar el temp (el WS event llegará con el real)
      messages.value = {
        ...messages.value,
        [chatId]: (messages.value[chatId] ?? []).filter(m => m.id !== tempId),
      }
    } catch (e) {
      console.error('[useChats] sendMessage error', e)
      // Revertir optimistic
      messages.value = {
        ...messages.value,
        [chatId]: (messages.value[chatId] ?? []).filter(m => !m.id.startsWith('temp_')),
      }
    }
  }

  async function editMessage(chatId: string, messageId: string, content: string) {
    try {
      await chatService.editMessage(chatId, messageId, content)
    } catch (e) {
      console.error('[useChats] editMessage error', e)
    }
  }

  async function deleteMessage(chatId: string, messageId: string) {
    try {
      await chatService.deleteMessage(chatId, messageId)
    } catch (e) {
      console.error('[useChats] deleteMessage error', e)
    }
  }

  async function createDirectChat(targetUserId: number): Promise<Chat | null> {
    try {
      const chat = await chatService.createDirectChat(targetUserId)
      // Agregar a la lista si no existe
      if (!chats.value.find(c => c.id === chat.id)) {
        chats.value = [chat, ...chats.value]
      }
      return chat
    } catch (e) {
      console.error('[useChats] createDirectChat error', e)
      return null
    }
  }

  async function createGroup(data: {
    name: string
    description?: string
    privacy: 'public' | 'private'
    memberIds?: number[]
  }): Promise<Chat | null> {
    try {
      const chat = await chatService.createGroup(data)
      chats.value = [chat, ...chats.value]
      return chat
    } catch (e) {
      console.error('[useChats] createGroup error', e)
      return null
    }
  }

  async function leaveGroup(chatId: string) {
    try {
      await chatService.leaveGroup(chatId)
      // Remover de la lista local
      chats.value = chats.value.filter(c => c.id !== chatId)
      if (activeChat.value?.id === chatId) activeChat.value = null
      chatSocketService.leaveChat(chatId)
    } catch (e) {
      console.error('[useChats] leaveGroup error', e)
    }
  }

  async function joinPublicGroup(chatId: string): Promise<boolean> {
    try {
      await chatService.joinPublicGroup(chatId)
      await fetchChats()
      return true
    } catch (e) {
      console.error('[useChats] joinPublicGroup error', e)
      return false
    }
  }

  async function requestJoin(chatId: string): Promise<boolean> {
    try {
      await chatService.requestJoinPrivateGroup(chatId)
      return true
    } catch (e) {
      console.error('[useChats] requestJoin error', e)
      return false
    }
  }

  async function respondToRequest(chatId: string, requestId: string, status: 'accepted' | 'rejected') {
    try {
      await chatService.respondJoinRequest(chatId, requestId, status)
    } catch (e) {
      console.error('[useChats] respondToRequest error', e)
    }
  }

  async function refreshChat(chatId: string) {
    try {
      const updated = await chatService.getChatById(chatId)
      chats.value = chats.value.map(c => c.id === chatId ? updated : c)
      if (activeChat.value?.id === chatId) activeChat.value = updated
    } catch (e) {
      console.error('[useChats] refreshChat error', e)
    }
  }

  function sendTyping(chatId: string) {
    chatSocketService.sendTyping(chatId)
  }

  function isOnline(userId: number) {
    return onlineUsers.value.has(userId)
  }

  function getChatUnread(chatId: string) {
    return unreadCounts.value[chatId] ?? 0
  }

  return {
    // State
    chats,
    activeChat,
    messages,
    loadingChats,
    loadingMessages,
    wsConnected,
    onlineUsers,
    typingUsers,
    unreadCounts,

    // Computed
    allChats,
    groupChats,
    directChats,
    totalUnread,
    activeChatMessages,
    activeChatTyping,

    // Methods
    connectSocket,
    disconnectSocket,
    fetchChats,
    fetchMessages,
    selectChat,
    sendMessage,
    editMessage,
    deleteMessage,
    createDirectChat,
    createGroup,
    leaveGroup,
    joinPublicGroup,
    requestJoin,
    respondToRequest,
    refreshChat,
    sendTyping,
    isOnline,
    getChatUnread,
  }
}