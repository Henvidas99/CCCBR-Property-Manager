<template>
  <div class="chats-page">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div>
          <p class="sidebar-eyebrow">CCCBR Manager</p>
          <h1 class="sidebar-title">Chats</h1>
        </div>
        <button class="compose-btn" title="Nuevo mensaje">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="sidebar-search">
        <svg xmlns="http://www.w3.org/2000/svg" class="s-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="search" placeholder="Buscar conversación…" class="s-input" />
      </div>

      <!-- Tabs -->
      <div class="sidebar-tabs">
        <button
          v-for="tab in tabs" :key="tab.key"
          :class="['s-tab', activeTab === tab.key && 'active']"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span v-if="tabUnread(tab.key) > 0" class="s-badge">{{ tabUnread(tab.key) }}</span>
        </button>
      </div>

      <!-- List -->
      <div class="sidebar-list">
        <ChatListItem
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="chat"
          :isActive="activeChat?.id === chat.id"
          @select="selectChatHandler(chat)"
        />
        <div v-if="filteredChats.length === 0" class="s-empty">
          <p>No hay conversaciones</p>
        </div>
      </div>
    </aside>

    <!-- Main detail area -->
    <main class="main-area">
      <Transition name="chat-transition" mode="out-in">
        <ChatDetail
          v-if="activeChat"
          :key="activeChat.id"
          :chat="activeChat"
          :showBack="false"
          @send="(text) => sendMessage(activeChat!.id, text)"
        />
        <div v-else class="no-chat-selected">
          <div class="no-chat-orb" />
          <div class="no-chat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 class="no-chat-title">Tus mensajes</h2>
          <p class="no-chat-sub">Selecciona una conversación para comenzar a chatear con otros brokers.</p>
        </div>
      </Transition>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChats } from '~/composables/useChats'
import ChatListItem from '../../components/chats/ChatListItem.vue'
import ChatDetail from '../../components/chats/ChatDetail.vue'

const { allChats, groupChats, activeChat, selectChat, sendMessage } = useChats()

const search = ref('')
const activeTab = ref<'all' | 'groups'>('all')

const tabs = [
  { key: 'all' as const, label: 'Todos' },
  { key: 'groups' as const, label: 'Grupos' },
]

const baseList = computed(() => activeTab.value === 'all' ? allChats.value : groupChats.value)

const filteredChats = computed(() =>
  search.value
    ? baseList.value.filter(c => c.name.toLowerCase().includes(search.value.toLowerCase()))
    : baseList.value
)

function tabUnread(key: 'all' | 'groups') {
  const list = key === 'all' ? allChats.value : groupChats.value
  return list.reduce((sum, c) => sum + c.unread, 0)
}

function selectChatHandler(chat: any) {
  selectChat(chat)
}

useSeoMeta({ title: 'Chats — CCCBR Manager' })
</script>

<style scoped>

.chats-page {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

/* ── Sidebar ─────────────────────────────────────── */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #eaecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f2f5;
}
.sidebar-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(135deg, #202d59, #a31e22);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 2px;
}
.sidebar-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1c1e21;
  margin: 0;
  letter-spacing: -0.02em;
}
.compose-btn {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.compose-btn:hover { transform: scale(1.07); box-shadow: 0 4px 12px rgba(163,30,34,0.3); }

.sidebar-search {
  position: relative;
  margin: 12px 16px 8px;
  flex-shrink: 0;
}
.s-icon {
  position: absolute;
  left: 10px; top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px;
  color: #b0b3b8;
}
.s-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border-radius: 10px;
  border: 1.5px solid #e4e6ea;
  background: #f8f9fb;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
}
.s-input:focus { border-color: #202d59; background: #fff; }

.sidebar-tabs {
  display: flex;
  gap: 4px;
  padding: 0 12px 10px;
  flex-shrink: 0;
}
.s-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 16px;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  background: transparent;
  color: #65676b;
  cursor: pointer;
  transition: all 0.2s;
}
.s-tab:hover { background: #f0f2f5; }
.s-tab.active {
  background: linear-gradient(135deg, rgba(32,45,89,0.08), rgba(163,30,34,0.08));
  border-color: rgba(32,45,89,0.2);
  color: #202d59;
}
.s-badge {
  min-width: 16px; height: 16px;
  padding: 0 4px;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}
.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.08) transparent;
}
.s-empty {
  text-align: center;
  padding: 40px 0;
  color: #b0b3b8;
  font-size: 0.85rem;
}

/* ── Main area ───────────────────────────────────── */
.main-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #f8f9fb;
  position: relative;
  overflow: hidden;
}
.no-chat-orb {
  position: absolute;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(32,45,89,0.07) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.no-chat-icon {
  width: 88px; height: 88px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(32,45,89,0.1), rgba(163,30,34,0.1));
  display: flex; align-items: center; justify-content: center;
  color: #202d59;
  position: relative; z-index: 1;
}
.no-chat-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #1c1e21;
  margin: 0;
  position: relative; z-index: 1;
}
.no-chat-sub {
  font-size: 0.875rem;
  color: #b0b3b8;
  text-align: center;
  max-width: 280px;
  line-height: 1.6;
  margin: 0;
  position: relative; z-index: 1;
}

/* Transition */
.chat-transition-enter-active { animation: chatIn 0.25s ease; }
.chat-transition-leave-active { animation: chatIn 0.15s ease reverse; }
@keyframes chatIn { from { opacity: 0; transform: translateX(12px); } }

/* Mobile */
@media (max-width: 640px) {
  .sidebar { width: 100%; }
  .main-area { display: none; }
  .chats-page.detail-open .sidebar { display: none; }
  .chats-page.detail-open .main-area { display: flex; width: 100%; }
}
</style>