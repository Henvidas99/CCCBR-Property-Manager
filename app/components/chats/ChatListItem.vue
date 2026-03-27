<template>
  <button class="chat-item" :class="{ active: isActive }" @click="$emit('select')">
    <ChatAvatar :chat="chat" :size="44" />

    <div class="item-body">
      <div class="item-top">
        <span class="item-name">{{ displayName }}</span>
        <span class="item-time">{{ formattedTime }}</span>
      </div>
      <div class="item-bottom">
        <span class="item-preview">{{ isTyping ? chat.type === 'group' ? `${allUserTyping.filter(t => t.chatId === props.chat.id && t.userId !== user?.id).length} personas escribiendo...` : 'Escribiendo...' : previewText }}</span>
        <span v-if="unread > 0" class="unread-badge">{{ unread > 99 ? '99+' : unread }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Chat } from '~/composables/useChats'
import { useChats } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'
import ChatAvatar from './ChatAvatar.vue'

const props = defineProps<{ chat: Chat; isActive: boolean }>()
defineEmits(['select'])

const { getChatUnread, GetOnlineUsers, allUserTyping } = useChats()
const { user } = useUser()

const unread = computed(() => getChatUnread(props.chat.id))
const isTyping = computed(() => allUserTyping.value.some(t => t.chatId === props.chat.id && t.userId !== user.value?.id))
const displayName = computed(() => {
  if (props.chat.type === 'group') return props.chat.name ?? 'Grupo'
  // Para DM mostrar el nombre del otro usuario
  const other = props.chat.members?.find(m => m.userId !== user.value?.id)
  return other?.user?.fullName ?? props.chat.name ?? 'Chat'
})

const previewText = computed(() => {
  const msg = props.chat.lastMessage
  if (!msg) return 'Sin mensajes aún'
  if (msg.deletedAt) return '🚫 Mensaje eliminado'
  if (msg.attachments?.length) {
    const type = msg.attachments[0]?.type === 'image' ? '📷 Imagen' : '🎥 Video'
    return msg.content ? `${type} · ${msg.content}` : type
  }
  const prefix = msg.senderId === user.value?.id ? 'Tú: ' : ''
  return `${prefix}${msg.content ?? ''}`
})

const formattedTime = computed(() => {
  const msg = props.chat.lastMessage
  const dateStr = msg?.createdAt ?? props.chat.updatedAt
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)

  if (diffDays === 0) return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return date.toLocaleDateString('es', { weekday: 'short' })
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
})

onMounted(() => {
  if (props.chat.type === 'direct') {
    const otherId = props.chat.members?.find(m => m.userId !== user.value?.id)?.userId
    if (otherId) GetOnlineUsers() 
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

.chat-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; width: 100%;
  background: transparent; border: none; cursor: pointer;
  border-radius: 12px; transition: background 0.15s;
  font-family: 'DM Sans', sans-serif; text-align: left;
}
.chat-item:hover { background: rgba(32,45,89,0.05); }
.chat-item.active { background: rgba(32,45,89,0.09); }

.item-body { flex: 1; min-width: 0; }
.item-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 3px; }
.item-name { font-size: 0.875rem; font-weight: 600; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-time { font-size: 0.7rem; color: #b0b3b8; flex-shrink: 0; }
.item-bottom { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.item-preview { font-size: 0.8rem; color: #65676b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.unread-badge {
  flex-shrink: 0; min-width: 18px; height: 18px; padding: 0 5px;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff; font-size: 0.68rem; font-weight: 700;
  border-radius: 20px; display: flex; align-items: center; justify-content: center;
}
</style>