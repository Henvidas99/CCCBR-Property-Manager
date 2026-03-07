<template>
  <div class="chat-detail">
    <!-- Header -->
    <div class="detail-header">
      <button v-if="showBack" class="back-btn" @click="$emit('back')">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <ChatAvatar :chat="chat" :size="36" />
      <div class="detail-meta">
        <span class="detail-name">{{ chat.name }}</span>
        <span class="detail-sub">
          <template v-if="chat.type === 'direct'">
            <span :class="['status-dot', chat.online ? 'online' : 'offline']" />
            {{ chat.online ? 'En línea' : 'Desconectado' }}
          </template>
          <template v-else>
            {{ chat.members }} miembros
          </template>
        </span>
      </div>
    </div>

    <!-- Messages -->
    <div class="messages-scroll" ref="scrollEl">
      <div class="messages-inner">
        <TransitionGroup name="msg">
          <div
            v-for="msg in chat.messages"
            :key="msg.id"
            :class="['msg-row', msg.senderId === CURRENT_USER_ID ? 'mine' : 'theirs']"
          >
            <div :class="['bubble', msg.senderId === CURRENT_USER_ID ? 'bubble-mine' : 'bubble-theirs']">
              <p class="bubble-text">{{ msg.text }}</p>
              <span class="bubble-time">
                {{ msg.time }}
                <svg v-if="msg.senderId === CURRENT_USER_ID" xmlns="http://www.w3.org/2000/svg"
                  class="w-3 h-3 inline ml-1" :class="msg.read ? 'text-blue-400' : 'text-white/40'"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>

    <!-- Input -->
    <div class="composer">
      <input
        v-model="draft"
        class="composer-input"
        placeholder="Escribe un mensaje…"
        @keydown.enter="send"
      />
      <button class="send-btn" :disabled="!draft.trim()" @click="send">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Chat } from '../../composables/useChats'
import { CURRENT_USER_ID } from '../../composables/useChats'
import ChatAvatar from './ChatAvatar.vue'

const props = defineProps<{ chat: Chat; showBack?: boolean }>()
const emit = defineEmits(['send', 'back'])

const draft = ref('')
const scrollEl = ref<HTMLElement | null>(null)

function send() {
  if (!draft.value.trim()) return
  emit('send', draft.value)
  draft.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

watch(() => props.chat.messages.length, scrollToBottom, { immediate: true })
watch(() => props.chat.id, scrollToBottom)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');

.chat-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fb;
  font-family: 'DM Sans', sans-serif;
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}
.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #65676b;
  padding: 4px;
  display: flex;
  border-radius: 8px;
  transition: background 0.15s;
}
.back-btn:hover { background: #f0f2f5; }
.detail-meta { flex: 1; }
.detail-name {
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1c1e21;
  line-height: 1.2;
}
.detail-sub {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #65676b;
  margin-top: 1px;
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
}
.status-dot.online { background: #22c55e; }
.status-dot.offline { background: #d1d5db; }

/* Messages */
.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.1) transparent;
}
.messages-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 14px;
}
.msg-row {
  display: flex;
}
.msg-row.mine  { justify-content: flex-end; }
.msg-row.theirs { justify-content: flex-start; }

.bubble {
  max-width: 72%;
  padding: 9px 13px;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.45;
  position: relative;
}
.bubble-mine {
  background: linear-gradient(135deg, #202d59, #2a3a6e);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.bubble-theirs {
  background: #fff;
  color: #1c1e21;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.bubble-text { margin: 0; }
.bubble-time {
  display: block;
  font-size: 0.65rem;
  margin-top: 4px;
  opacity: 0.6;
  text-align: right;
}
.bubble-mine .bubble-time { color: rgba(255,255,255,0.7); }
.bubble-theirs .bubble-time { color: #b0b3b8; }

/* Composer */
.composer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fff;
  border-top: 1px solid #f0f2f5;
  flex-shrink: 0;
}
.composer-input {
  flex: 1;
  border: 1.5px solid #e4e6ea;
  border-radius: 20px;
  padding: 9px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  outline: none;
  background: #f8f9fb;
  transition: border-color 0.2s, background 0.2s;
}
.composer-input:focus {
  border-color: #202d59;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(32,45,89,0.08);
}
.send-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}
.send-btn:hover { transform: scale(1.07); box-shadow: 0 4px 12px rgba(163,30,34,0.3); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* Message animation */
.msg-enter-active { animation: msgIn 0.2s ease; }
@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>