// composables/useChats.ts
export interface ChatMessage {
  id: number
  senderId: number
  text: string
  time: string
  read: boolean
}

export interface Chat {
  id: number
  type: 'direct' | 'group'
  name: string
  avatar: string
  avatarColor: string
  lastMessage: string
  lastTime: string
  unread: number
  online?: boolean
  members?: number
  messages: ChatMessage[]
}

export const CURRENT_USER_ID = 0

export const useChats = () => {
  const chats = ref<Chat[]>([
    {
      id: 1, type: 'direct',
      name: 'María Fernández',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Maria&backgroundColor=ffd5dc',
      avatarColor: '#ffd5dc',
      lastMessage: '¿El precio es negociable?',
      lastTime: '10:24', unread: 2, online: true,
      messages: [
        { id: 1, senderId: 1, text: 'Hola, vi tu publicación en el foro 👋', time: '10:10', read: true },
        { id: 2, senderId: 0, text: '¡Hola María! Sí, dime en qué puedo ayudarte.', time: '10:12', read: true },
        { id: 3, senderId: 1, text: 'Me interesa la casa en Santa Ana, ¿sigue disponible?', time: '10:18', read: true },
        { id: 4, senderId: 0, text: 'Sí, está disponible. Puedes visitarla este fin de semana.', time: '10:20', read: true },
        { id: 5, senderId: 1, text: '¿El precio es negociable?', time: '10:24', read: false },
      ],
    },
    {
      id: 2, type: 'direct',
      name: 'Roberto Jiménez',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Roberto&backgroundColor=d1fae5',
      avatarColor: '#d1fae5',
      lastMessage: 'Perfecto, mañana te confirmo 👍',
      lastTime: '09:50', unread: 0, online: true,
      messages: [
        { id: 1, senderId: 2, text: 'Buenos días, ¿tienes propiedades en Escazú?', time: '09:30', read: true },
        { id: 2, senderId: 0, text: 'Buenos días Roberto. Sí tengo un apartamento piso 8, ¿te interesa?', time: '09:35', read: true },
        { id: 3, senderId: 2, text: 'Perfecto, mañana te confirmo 👍', time: '09:50', read: true },
      ],
    },
    {
      id: 3, type: 'direct',
      name: 'Sofía Mora',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia&backgroundColor=e0e7ff',
      avatarColor: '#e0e7ff',
      lastMessage: 'Enviame las fotos del lote 📷',
      lastTime: 'Ayer', unread: 1, online: false,
      messages: [
        { id: 1, senderId: 3, text: 'Hola! Vi el lote en Guanacaste que publicaste', time: 'Ayer 15:00', read: true },
        { id: 2, senderId: 0, text: 'Sí Sofía, es una joya. Frente al mar.', time: 'Ayer 15:05', read: true },
        { id: 3, senderId: 3, text: 'Enviame las fotos del lote 📷', time: 'Ayer 15:30', read: false },
      ],
    },
    {
      id: 4, type: 'group',
      name: 'Brokers CR — Zona Norte',
      avatar: '',
      avatarColor: '#202d59',
      lastMessage: 'Luis: ¿Alguien tiene contactos en Alajuela?',
      lastTime: '11:02', unread: 5, members: 12,
      messages: [
        { id: 1, senderId: 1, text: 'Buenos días a todos 🌞', time: '08:00', read: true },
        { id: 2, senderId: 2, text: 'Buenos días! Hoy hay reunión virtual a las 3pm', time: '08:30', read: true },
        { id: 3, senderId: 0, text: 'Confirmado, ahí estaré.', time: '08:45', read: true },
        { id: 4, senderId: 3, text: '¿Alguien tiene contactos en Alajuela?', time: '11:02', read: false },
      ],
    },
    {
      id: 5, type: 'group',
      name: 'CCCBR — Equipo Ventas',
      avatar: '',
      avatarColor: '#a31e22',
      lastMessage: 'Admin: Reporte mensual disponible',
      lastTime: 'Ayer', unread: 0, members: 8,
      messages: [
        { id: 1, senderId: 99, text: 'Reporte mensual disponible en el dashboard', time: 'Ayer 09:00', read: true },
        { id: 2, senderId: 0, text: 'Gracias, lo reviso ahora.', time: 'Ayer 09:15', read: true },
      ],
    },
  ])

  const activeChat = ref<Chat | null>(null)

  const allChats = computed(() => chats.value)
  const groupChats = computed(() => chats.value.filter(c => c.type === 'group'))
  const directChats = computed(() => chats.value.filter(c => c.type === 'direct'))

  function selectChat(chat: Chat) {
    activeChat.value = chat
    chat.unread = 0
  }

  function sendMessage(chatId: number, text: string) {
    const chat = chats.value.find(c => c.id === chatId)
    if (!chat || !text.trim()) return
    const msg: ChatMessage = {
      id: Date.now(),
      senderId: CURRENT_USER_ID,
      text: text.trim(),
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    }
    chat.messages.push(msg)
    chat.lastMessage = text.trim()
    chat.lastTime = msg.time
  }

  return { chats, allChats, groupChats, directChats, activeChat, selectChat, sendMessage }
}