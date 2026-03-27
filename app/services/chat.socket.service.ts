import { io, type Socket } from 'socket.io-client'

// ─── Event names (deben coincidir con el backend) ─────────────────────────────

export const WS_EVENTS = {
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  MARK_READ: 'mark_read',
} as const

export const WS_SERVER_EVENTS = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_DELETED: 'message_deleted',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  MESSAGES_READ: 'messages_read',
  UNREAD_COUNT_UPDATE: 'unread_count_update',
  JOIN_REQUEST_NEW: 'join_request_new',
  JOIN_REQUEST_RESPONSE: 'join_request_response',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_LEFT: 'member_left',
} as const

// ─── Tipos de eventos ─────────────────────────────────────────────────────────

export type WsEventHandlers = {
  onNewMessage?: (msg: any) => void
  onMessageEdited?: (msg: any) => void
  onMessageDeleted?: (data: { messageId: string; chatId: string }) => void
  onUserTyping?: (data: { chatId: string; userId: number; timestamp: string }) => void
  onUserStopTyping?: (data: { chatId: string; userId: number }) => void
  onUserOnline?: (data: { userId: number; timestamp: string }) => void
  onUserOffline?: (data: { userId: number; lastSeen: string }) => void
  onMessagesRead?: (data: { chatId: string; userId: number; messageIds: string[]; readAt: string }) => void
  onUnreadCountUpdate?: (data: { chatId: string; unreadCount: number }) => void
  onJoinRequestNew?: (request: any) => void
  onJoinRequestResponse?: (data: { chatId: string; status: string; reviewedAt: string }) => void
  onMemberAdded?: (data: { chatId: string; user: any }) => void
  onMemberRemoved?: (data: { chatId: string; userId: number }) => void
  onMemberLeft?: (data: { chatId: string; userId: number }) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (err: Error) => void
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

class ChatSocketService {
  private socket: Socket | null = null
  private typingTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  connect(token: string, handlers: WsEventHandlers = {}) {
    if (this.socket?.connected) return

    const config = useRuntimeConfig()
    const baseUrl = (config.public.apiBase as string).replace('/api', '')

    this.socket = io(`${baseUrl}/chat`, {
      auth: { token: `Bearer ${token}` },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      transports: ['websocket', 'polling'],
    })

    this.socket.on('connect', () => {
      console.log('[Chat WS] Conectado')
      handlers.onConnect?.()
    })

    this.socket.on('disconnect', () => {
      console.log('[Chat WS] Desconectado')
      handlers.onDisconnect?.()
    })

    this.socket.on('connect_error', (err) => {
      console.error('[Chat WS] Error de conexión:', err.message)
      handlers.onError?.(err)
    })

    // Mensajes
    this.socket.on(WS_SERVER_EVENTS.NEW_MESSAGE, handlers.onNewMessage ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.MESSAGE_EDITED, handlers.onMessageEdited ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.MESSAGE_DELETED, handlers.onMessageDeleted ?? (() => {}))

    // Typing
    this.socket.on(WS_SERVER_EVENTS.USER_TYPING, handlers.onUserTyping ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.USER_STOP_TYPING, handlers.onUserStopTyping ?? (() => {}))

    // Presencia
    this.socket.on(WS_SERVER_EVENTS.USER_ONLINE, handlers.onUserOnline ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.USER_OFFLINE, handlers.onUserOffline ?? (() => {}))

    // Lecturas
    this.socket.on(WS_SERVER_EVENTS.MESSAGES_READ, handlers.onMessagesRead ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.UNREAD_COUNT_UPDATE, handlers.onUnreadCountUpdate ?? (() => {}))

    // Solicitudes
    this.socket.on(WS_SERVER_EVENTS.JOIN_REQUEST_NEW, handlers.onJoinRequestNew ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.JOIN_REQUEST_RESPONSE, handlers.onJoinRequestResponse ?? (() => {}))

    // Miembros
    this.socket.on(WS_SERVER_EVENTS.MEMBER_ADDED, handlers.onMemberAdded ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.MEMBER_REMOVED, handlers.onMemberRemoved ?? (() => {}))
    this.socket.on(WS_SERVER_EVENTS.MEMBER_LEFT, handlers.onMemberLeft ?? (() => {}))
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
    this.typingTimers.forEach(t => clearTimeout(t))
    this.typingTimers.clear()
  }

  joinChat(chatId: string) {
    this.socket?.emit(WS_EVENTS.JOIN_CHAT, { chatId })
  }

  leaveChat(chatId: string) {
    this.socket?.emit(WS_EVENTS.LEAVE_CHAT, { chatId })
  }

  sendTyping(chatId: string) {
    this.socket?.emit(WS_EVENTS.TYPING_START, { chatId })

    const existing = this.typingTimers.get(chatId)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(() => {
      this.socket?.emit(WS_EVENTS.TYPING_STOP, { chatId })
      this.typingTimers.delete(chatId)
    }, 1000)

    this.typingTimers.set(chatId, timer)
  }

  stopTyping(chatId: string) {
    const existing = this.typingTimers.get(chatId)
    if (existing) {
      clearTimeout(existing)
      this.typingTimers.delete(chatId)
    }
    this.socket?.emit(WS_EVENTS.TYPING_STOP, { chatId })
  }

  markRead(chatId: string, lastReadMessageId: string) {
    this.socket?.emit(WS_EVENTS.MARK_READ, { chatId, lastReadMessageId })
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const chatSocketService = new ChatSocketService()