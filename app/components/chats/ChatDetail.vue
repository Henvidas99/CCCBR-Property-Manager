<template>
  <div class="chat-detail" :class="{ 'panel-open': showInfo }">
    <!-- Header -->
    <div class="detail-header" @click="chat.type === 'group' && (showInfo = !showInfo)" :class="{ clickable: chat.type === 'group' }">
      <button v-if="showBack" class="back-btn" @click.stop="$emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <ChatAvatar :chat="chat" :size="36" />

      <div class="detail-meta">
        <span class="detail-name">{{ displayName }}</span>
        <span class="detail-sub">
          <template v-if="chat.type === 'direct'">
            <span :class="['status-dot', isOtherOnline ? 'online' : 'offline']"/>
            {{ isOtherOnline ? 'En línea' : lastSeenText }}
          </template>
          <template v-else>
            {{ activeMembers }} miembros
            <template v-if="typingInChat.length > 0">
              · <span class="typing-indicator">alguien está escribiendo…</span>
            </template>
          </template>
        </span>
      </div>

      <div class="header-actions" @click.stop>
        <button v-if="chat.type === 'group'" class="hdr-btn" title="Info del grupo"
          @click="showInfo = !showInfo">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages area + GroupInfoPanel side by side -->
    <div class="detail-body">
      <div class="messages-area">
        <!-- Load more -->
        <div class="load-more-wrap" v-if="hasMoreMessages">
          <button class="load-more-btn" :disabled="loadingMessages" @click="loadMore">
            <div v-if="loadingMessages" class="btn-spinner"/>
            <span v-else>Cargar mensajes anteriores</span>
          </button>
        </div>

        <!-- Messages scroll -->
        <div class="messages-scroll" ref="scrollEl">
          <div class="messages-inner">
            <TransitionGroup name="msg">
              <template v-for="msg in chatMessages" :key="msg.id">
                <!-- Date separator -->
                <div v-if="shouldShowDate(msg)" class="date-sep">
                  <span>{{ formatMsgDate(msg.createdAt) }}</span>
                </div>

                <div :class="['msg-row', msg.senderId === currentUserId ? 'mine' : 'theirs']"
                  @mouseenter="hoveredMsg = msg.id" @mouseleave="hoveredMsg = null">

                  <!-- Avatar para mensajes ajenos en grupos -->
                  <div v-if="chat.type === 'group' && msg.senderId !== currentUserId" class="msg-avatar">
                    <img v-if="msg.sender?.photo" :src="msg.sender.photo" class="msg-av-img"/>
                    <span v-else class="msg-av-initials">{{ initials(msg.sender?.fullName) }}</span>
                  </div>

                  <div class="bubble-wrap">
                    <!-- Nombre del remitente en grupos -->
                    <span v-if="chat.type === 'group' && msg.senderId !== currentUserId" class="sender-name">
                      {{ msg.sender?.fullName }}
                    </span>

                    <!-- Reply preview -->
                    <div v-if="msg.replyTo" class="reply-preview" :class="msg.senderId === currentUserId ? 'mine' : 'theirs'">
                      <span class="reply-author">{{ msg.replyTo.sender?.fullName ?? 'Tú' }}</span>
                      <span class="reply-text">{{ msg.replyTo.deletedAt ? '🚫 Eliminado' : (msg.replyTo.content ?? '📎 Adjunto') }}</span>
                    </div>

                    <!-- Bubble -->
                    <div :class="['bubble', msg.senderId === currentUserId ? 'bubble-mine' : 'bubble-theirs', msg.deletedAt ? 'deleted' : '']">
                      <!-- Deleted -->
                      <p v-if="msg.deletedAt" class="bubble-deleted">🚫 Mensaje eliminado</p>

                      <template v-else>
                        <!-- Attachments -->
                        <div v-if="msg.attachments?.length" class="attachments-grid">
                          <div v-for="att in msg.attachments" :key="att.id" class="att-item">
                            <img v-if="att.type === 'image'" :src="att.url" :alt="att.originalName"
                              class="att-img" @click="openMedia(att.url)" />
                            <video v-else :src="att.url" class="att-video" controls />
                          </div>
                        </div>

                        <!-- Text -->
                        <p v-if="msg.content" class="bubble-text">{{ msg.content }}</p>
                        <span v-if="msg.isEdited" class="edited-label">(editado)</span>
                      </template>

                      <!-- Time + read -->
                      <span class="bubble-time">
                        {{ formatTime(msg.createdAt) }}
                        <template v-if="msg.senderId === currentUserId && !msg.deletedAt">
                          <svg xmlns="http://www.w3.org/2000/svg"
                            class="w-3 h-3 inline ml-1"
                            :class="isRead(msg) ? 'text-blue-400' : 'opacity-50'"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                        </template>
                      </span>
                    </div>
                  </div>

                  <!-- Actions on hover -->
                  <Transition name="fade">
                    <div v-if="hoveredMsg === msg.id && !msg.deletedAt"
                      :class="['msg-actions', msg.senderId === currentUserId ? 'left' : 'right']">
                      <button class="ma-btn" title="Responder" @click="replyTo = msg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                      </button>
                      <button v-if="msg.senderId === currentUserId" class="ma-btn" title="Editar" @click="startEdit(msg)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button v-if="canDelete(msg)" class="ma-btn danger" title="Eliminar" @click="confirmDelete(msg.id)">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </Transition>
                </div>
              </template>
            </TransitionGroup>

            <!-- Typing indicator -->
            <div v-if="typingInChat.length > 0" class="typing-row">
              <div class="typing-bubble">
                <span class="typing-dots"><span/><span/><span/></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Group info panel -->
      <GroupInfoPanel
        v-if="chat.type === 'group'"
        v-model="showInfo"
        :chat="localChat"
        @set-admin="handleSetAdmin"
        @demote-admin="handleDemoteAdmin"
        @remove-member="handleRemoveMember"
        @leave="emit('leave')"
        @chat-updated="handleChatUpdated"
        ref="infoPanelRef"
      />
    </div>

    <!-- Reply preview bar -->
    <Transition name="reply-bar">
      <div v-if="replyTo" class="reply-bar">
        <div class="reply-bar-content">
          <span class="reply-bar-label">Respondiendo a {{ replyTo.sender?.fullName ?? 'Tú' }}</span>
          <span class="reply-bar-text">{{ replyTo.content ?? '📎 Adjunto' }}</span>
        </div>
        <button class="reply-close" @click="replyTo = null">✕</button>
      </div>
    </Transition>

    <!-- Edit bar -->
    <Transition name="reply-bar">
      <div v-if="editingMsg" class="edit-bar">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <span>Editando mensaje</span>
        <button class="reply-close" @click="cancelEdit">✕</button>
      </div>
    </Transition>

    <!-- Attachment previews -->
    <div v-if="attachmentFiles.length > 0" class="att-preview-bar">
      <div v-for="(f, i) in attachmentFiles" :key="i" class="att-preview-item">
        <img v-if="f.type.startsWith('image')" :src="previewUrls[i]" class="att-thumb"/>
        <div v-else class="att-video-thumb">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
          </svg>
        </div>
        <button class="att-remove" @click="removeFile(i)">✕</button>
      </div>
    </div>

    <!-- Composer -->
    <div class="composer">
      <label class="attach-btn" title="Adjuntar">
        <input ref="fileInput" type="file" multiple accept="image/*,video/*" class="hidden" @change="onFileChange"/>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
        </svg>
      </label>

      <input
        v-model="draft"
        ref="inputEl"
        class="composer-input"
        :placeholder="editingMsg ? 'Editando mensaje…' : 'Escribe un mensaje…'"
        @keydown.enter.exact.prevent="send"
        @keydown.escape="cancelEdit(); replyTo = null"
        @input="onTyping"
      />

      <button class="send-btn" :disabled="!canSend || loadingSendMessage" @click="send">
        <div v-if="loadingSendMessage" class="send-spinner"/>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </button>
    </div>

    <!-- Media lightbox -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="lightboxUrl" class="lightbox" @click="lightboxUrl = null">
          <img :src="lightboxUrl" class="lightbox-img"/>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirmation dialog -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="deleteDialog.show" class="dialog-backdrop" @click.self="deleteDialog.show = false">
          <Transition name="dialog-pop">
            <div v-if="deleteDialog.show" class="dialog-box">
              <div class="dialog-icon danger">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h4 class="dialog-title">Eliminar mensaje</h4>
              <p class="dialog-msg">¿Seguro que quieres eliminar este mensaje? Esta acción no se puede deshacer.</p>
              <div class="dialog-actions">
                <button class="dialog-cancel" @click="deleteDialog.show = false">Cancelar</button>
                <button class="dialog-confirm danger" @click="doDelete">Eliminar</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Chat, ChatMessage } from '~/composables/useChats'
import { useChats } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'
import { chatService } from '~/services/chat.service'
import ChatAvatar from './ChatAvatar.vue'
import GroupInfoPanel from './GroupInfoPanel.vue'
import { formatLastSeenAt } from '~/helpers/global.helpers'

const props = defineProps<{ chat: Chat; showBack?: boolean }>()
const emit = defineEmits(['back', 'set-admin', 'demote-admin', 'remove-member', 'leave'])

const {
  activeChatMessages, activeChatTyping, loadingMessages,
  fetchMessages, sendMessage, editMessage, deleteMessage,
  sendTyping, isOnline, loadingSendMessage, refreshChat,
  selectChat, hasMore
} = useChats()
const { user } = useUser()

const currentUserId = computed(() => user.value?.id)

// Local copy of chat so we can reactively update avatar/name without waiting for ws
const localChat = ref<Chat>({ ...props.chat })
watch(() => props.chat, (val) => { localChat.value = { ...val } }, { deep: true })

const scrollEl = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)
const infoPanelRef = ref<any>(null)
const draft = ref('')
const hoveredMsg = ref<string | null>(null)
const replyTo = ref<ChatMessage | null>(null)
const editingMsg = ref<ChatMessage | null>(null)
const showInfo = ref(false)
const lightboxUrl = ref<string | null>(null)
const attachmentFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])

const deleteDialog = ref({ show: false, msgId: '' })

const chatMessages = computed(() => activeChatMessages.value)
const typingInChat = computed(() => activeChatTyping.value)
const hasMoreMessages = computed(() => hasMore.value[props.chat.id] ?? false)

const displayName = computed(() => {
  if (localChat.value.type === 'group') return localChat.value.name ?? 'Grupo'
  const other = localChat.value.members?.find(m => m.userId !== currentUserId.value)
  return other?.user?.fullName ?? localChat.value.name ?? 'Chat'
})
const activeMembers = computed(() => localChat.value.members?.filter(m => !m.hasLeft).length ?? 0)
const otherMember = computed(() => localChat.value.members?.find(m => m.userId !== currentUserId.value))
const isOtherOnline = computed(() => otherMember.value ? isOnline(otherMember.value.userId) : false)
const lastSeenText = computed(() => formatLastSeenAt(otherMember.value?.user.lastSeenAt))
const isCurrentUserAdmin = computed(() =>
  localChat.value.members?.some(m => m.userId === currentUserId.value && m.role === 'admin') ?? false
)
const canSend = computed(() => draft.value.trim() || attachmentFiles.value.length > 0)

function canDelete(msg: ChatMessage) {
  return msg.senderId === currentUserId.value || isCurrentUserAdmin.value
}

function isRead(msg: ChatMessage) {
  return msg.reads?.some(r => r.userId !== currentUserId.value) ?? false
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

let prevDate = ''
function shouldShowDate(msg: ChatMessage) {
  const date = new Date(msg.createdAt).toDateString()
  if (date !== prevDate) { prevDate = date; return true }
  return false
}

function formatMsgDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return 'Hoy'
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function onTyping() {
  sendTyping(props.chat.id)
}

async function send() {
  if (!canSend.value) return
  if (editingMsg.value) {
    await editMessage(props.chat.id, editingMsg.value.id, draft.value)
    cancelEdit()
    return
  }
  await sendMessage(props.chat.id, draft.value, attachmentFiles.value, replyTo.value?.id)
  draft.value = ''
  replyTo.value = null
  attachmentFiles.value = []
  previewUrls.value = []
  scrollToBottom()
}

function startEdit(msg: ChatMessage) {
  editingMsg.value = msg
  draft.value = msg.content ?? ''
  nextTick(() => inputEl.value?.focus())
}

function cancelEdit() {
  editingMsg.value = null
  draft.value = ''
}

function confirmDelete(msgId: string) {
  deleteDialog.value = { show: true, msgId }
}

async function doDelete() {
  await deleteMessage(props.chat.id, deleteDialog.value.msgId)
  deleteDialog.value.show = false
}

function loadMore() {
  fetchMessages(props.chat.id, true)
}

function onFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  const remaining = 10 - attachmentFiles.value.length
  const toAdd = files.slice(0, remaining)
  attachmentFiles.value = [...attachmentFiles.value, ...toAdd]
  toAdd.forEach(f => previewUrls.value.push(URL.createObjectURL(f)))
}

function removeFile(idx: number) {
  URL.revokeObjectURL(previewUrls.value[idx]!)
  attachmentFiles.value.splice(idx, 1)
  previewUrls.value.splice(idx, 1)
}

function openMedia(url: string) { lightboxUrl.value = url }

// ── Admin actions (with optimistic local update + server refresh) ──────
async function handleSetAdmin(userId: number) {
  try {
    await chatService.setAdmin(props.chat.id, userId)
    await refreshChat(props.chat.id)
  } catch (e) {
    console.error('[ChatDetail] setAdmin error', e)
  }
}

async function handleDemoteAdmin(userId: number) {
  try {
    await chatService.demoteAdmin(props.chat.id, userId)
    await refreshChat(props.chat.id)
  } catch (e) {
    console.error('[ChatDetail] demoteAdmin error', e)
  }
}

async function handleRemoveMember(userId: number) {
  try {
    await chatService.removeMember(props.chat.id, userId)
    await refreshChat(props.chat.id)
  } catch (e) {
    console.error('[ChatDetail] removeMember error', e)
  }
}

// Called when GroupInfoPanel updates avatar or info
async function handleChatUpdated(updatedChat: Chat | null) {
  // If we got the updated chat object directly, use it; otherwise fetch from server
  if (updatedChat) {
    localChat.value = updatedChat
  }
  // Always refresh the global state so sidebar etc. get updated
  await refreshChat(props.chat.id)
}

function scrollToBottom(smooth = false) {
  nextTick(() => {
    if (scrollEl.value) {
      scrollEl.value.scrollTo({ top: scrollEl.value.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    }
  })
}

onMounted(() => scrollToBottom())
watch(() => props.chat.id, async (id) => {
  if (id) {
    await selectChat(props.chat)
  }
}, { immediate: true })
watch(() => chatMessages.value.length, () => scrollToBottom())
watch(() => props.chat.id, () => { prevDate = ''; scrollToBottom() })
</script>

<style scoped>
.chat-detail { display: flex; flex-direction: column; height: 100%; background: #f8f9fb; font-family: 'DM Sans', sans-serif; position: relative; }

/* Header */
.detail-header { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #f0f2f5; flex-shrink: 0; }
.detail-header.clickable { cursor: pointer; }
.detail-header.clickable:hover { background: #f8f9fb; }
.back-btn { background: none; border: none; cursor: pointer; color: #65676b; padding: 4px; display: flex; border-radius: 8px; transition: background 0.15s; }
.back-btn:hover { background: #f0f2f5; }
.detail-meta { flex: 1; }
.detail-name { display: block; font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #1c1e21; line-height: 1.2; }
.detail-sub { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: #65676b; margin-top: 1px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; }
.status-dot.online { background: #22c55e; }
.status-dot.offline { background: #d1d5db; }
.typing-indicator { color: #202d59; font-style: italic; }
.header-actions { display: flex; gap: 6px; }
.hdr-btn { background: none; border: none; cursor: pointer; color: #65676b; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.15s; }
.hdr-btn:hover { background: #f0f2f5; color: #202d59; }

/* Body */
.detail-body { display: flex; flex: 1; overflow: hidden; position: relative; }
.messages-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Load more */
.load-more-wrap { padding: 8px 16px; display: flex; justify-content: center; flex-shrink: 0; }
.load-more-btn { padding: 6px 16px; border-radius: 20px; border: 1.5px solid #e4e6ea; background: #fff; font-size: 0.78rem; font-weight: 600; color: #65676b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.load-more-btn:hover { border-color: #202d59; color: #202d59; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid #e4e6ea; border-top-color: #202d59; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Messages */
.messages-scroll { flex: 1; overflow-y: auto; padding: 12px 0; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.1) transparent; }
.messages-inner { display: flex; flex-direction: column; gap: 4px; padding: 0 14px; }

.date-sep { text-align: center; margin: 10px 0 4px; }
.date-sep span { font-size: 0.7rem; color: #b0b3b8; background: #f0f2f5; padding: 3px 10px; border-radius: 20px; }

.msg-row { display: flex; align-items: flex-end; gap: 6px; position: relative; padding: 1px 0; }
.msg-row.mine { justify-content: flex-end; }
.msg-row.theirs { justify-content: flex-start; }

.msg-avatar { width: 26px; height: 26px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: linear-gradient(135deg, #202d59, #a31e22); display: flex; align-items: center; justify-content: center; }
.msg-av-img { width: 100%; height: 100%; object-fit: cover; }
.msg-av-initials { color: #fff; font-size: 0.6rem; font-weight: 700; }

.bubble-wrap { display: flex; flex-direction: column; max-width: 70%; }
.msg-row.mine .bubble-wrap { align-items: flex-end; }
.sender-name { font-size: 0.7rem; font-weight: 600; color: #202d59; margin-bottom: 2px; padding: 0 4px; }

.reply-preview { padding: 5px 10px; border-radius: 8px; margin-bottom: 3px; border-left: 3px solid; }
.reply-preview.mine { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.5); }
.reply-preview.theirs { background: #f0f2f5; border-color: #202d59; }
.reply-author { display: block; font-size: 0.68rem; font-weight: 700; color: #202d59; }
.reply-preview.mine .reply-author { color: rgba(255,255,255,0.8); }
.reply-text { font-size: 0.72rem; color: #65676b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; max-width: 200px; }
.reply-preview.mine .reply-text { color: rgba(255,255,255,0.7); }

.bubble { padding: 9px 13px; border-radius: 16px; font-size: 0.875rem; line-height: 1.45; position: relative; }
.bubble-mine { background: linear-gradient(135deg, #202d59, #2a3a6e); color: #fff; border-bottom-right-radius: 4px; }
.bubble-theirs { background: #fff; color: #1c1e21; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.bubble.deleted { background: #f0f2f5 !important; box-shadow: none !important; }
.bubble-deleted { margin: 0; font-style: italic; color: #b0b3b8; font-size: 0.82rem; }
.bubble-text { margin: 0; white-space: pre-wrap; word-break: break-word; }
.edited-label { font-size: 0.65rem; opacity: 0.6; }
.bubble-time { display: block; font-size: 0.65rem; margin-top: 4px; opacity: 0.6; text-align: right; }
.bubble-mine .bubble-time { color: rgba(255,255,255,0.7); }
.bubble-theirs .bubble-time { color: #b0b3b8; }
.send-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }

/* Attachments */
.attachments-grid { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.att-item { border-radius: 8px; overflow: hidden; }
.att-img { max-width: 200px; max-height: 200px; object-fit: cover; cursor: zoom-in; display: block; }
.att-video { max-width: 240px; max-height: 180px; border-radius: 8px; }

/* Message actions */
.msg-actions { position: absolute; top: 50%; transform: translateY(-50%); display: flex; gap: 3px; background: #fff; border-radius: 10px; padding: 3px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); z-index: 5; }
.msg-actions.left { right: calc(100% + 8px); }
.msg-actions.right { left: calc(100% + 8px); }
.ma-btn { width: 26px; height: 26px; border-radius: 6px; border: none; cursor: pointer; background: transparent; color: #65676b; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.ma-btn:hover { background: #f0f2f5; color: #202d59; }
.ma-btn.danger:hover { background: #fee2e2; color: #dc2626; }

/* Typing */
.typing-row { display: flex; padding: 4px 0; }
.typing-bubble { background: #fff; padding: 10px 14px; border-radius: 16px; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.typing-dots { display: flex; gap: 3px; align-items: center; }
.typing-dots span { width: 6px; height: 6px; background: #b0b3b8; border-radius: 50%; animation: typingDot 1.2s ease-in-out infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }

/* Reply bar */
.reply-bar, .edit-bar { display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #f0f2f5; border-top: 1px solid #e4e6ea; flex-shrink: 0; }
.edit-bar { background: #eff6ff; border-top-color: #bfdbfe; color: #202d59; font-size: 0.82rem; font-weight: 500; }
.reply-bar-content { flex: 1; min-width: 0; }
.reply-bar-label { display: block; font-size: 0.7rem; font-weight: 700; color: #202d59; }
.reply-bar-text { font-size: 0.75rem; color: #65676b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.reply-close { background: none; border: none; cursor: pointer; color: #65676b; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; transition: background 0.15s; }
.reply-close:hover { background: #e4e6ea; }

/* Attachment preview bar */
.att-preview-bar { display: flex; gap: 8px; padding: 8px 14px; background: #fff; border-top: 1px solid #f0f2f5; overflow-x: auto; flex-shrink: 0; }
.att-preview-item { position: relative; flex-shrink: 0; }
.att-thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; }
.att-video-thumb { width: 56px; height: 56px; background: #202d59; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.att-remove { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #dc2626; color: #fff; border: none; border-radius: 50%; cursor: pointer; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; }

/* Composer */
.composer { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #fff; border-top: 1px solid #f0f2f5; flex-shrink: 0; }
.attach-btn { width: 36px; height: 36px; border-radius: 10px; background: #f0f2f5; color: #65676b; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.attach-btn:hover { background: #e4e6ea; color: #202d59; }
.hidden { display: none; }
.composer-input { flex: 1; border: 1.5px solid #e4e6ea; border-radius: 20px; padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; outline: none; background: #f8f9fb; transition: all 0.2s; }
.composer-input:focus { border-color: #202d59; background: #fff; box-shadow: 0 0 0 3px rgba(32,45,89,0.08); }
.send-btn { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #202d59, #a31e22); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.send-btn:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 4px 12px rgba(163,30,34,0.3); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Lightbox */
.lightbox { position: fixed; inset: 0; z-index: 400; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
.lightbox-img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }

/* Delete dialog */
.dialog-backdrop { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.dialog-box { width: 340px; max-width: 100%; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; font-family: 'DM Sans', sans-serif; }
.dialog-icon { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.dialog-icon.danger { background: #fee2e2; color: #dc2626; }
.dialog-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; color: #1c1e21; margin: 0; }
.dialog-msg { font-size: 0.85rem; color: #65676b; line-height: 1.5; margin: 0; }
.dialog-actions { display: flex; gap: 8px; width: 100%; margin-top: 4px; }
.dialog-cancel { flex: 1; padding: 9px; border-radius: 10px; border: 1.5px solid #e4e6ea; background: transparent; color: #65676b; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.dialog-cancel:hover { background: #f0f2f5; }
.dialog-confirm { flex: 1; padding: 9px; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
.dialog-confirm.danger { background: #dc2626; color: #fff; }
.dialog-confirm.danger:hover { background: #b91c1c; }

/* Transitions */
.msg-enter-active { animation: msgIn 0.2s ease; }
@keyframes msgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.reply-bar-enter-active { animation: replyIn 0.2s ease; }
.reply-bar-leave-active { animation: replyIn 0.15s ease reverse; }
@keyframes replyIn { from { opacity: 0; transform: translateY(8px); } }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.dialog-pop-enter-active { animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.dialog-pop-leave-active { animation: popIn 0.15s ease reverse; }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } }
</style>