<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal-container">

            <!-- ── Left panel: list ─────────────────────────── -->
            <div class="panel-list" :class="{ 'hide-mobile': !!activeChat }">

              <!-- Header -->
              <div class="panel-header">
                <h2 class="panel-title">Mensajes</h2>
                <div class="header-actions">
                  <!-- Expand tooltip button -->
                  <div class="tooltip-wrap">
                    <NuxtLink to="/chats" class="icon-btn" @click="$emit('update:modelValue', false)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </NuxtLink>
                    <span class="tooltip">Ver completo</span>
                  </div>
                  <button class="icon-btn" @click="$emit('update:modelValue', false)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Search -->
              <div class="search-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input v-model="search" placeholder="Buscar chats…" class="search-input" />
              </div>

              <!-- Tabs -->
              <div class="tabs">
                <button
                  v-for="tab in tabs" :key="tab.key"
                  :class="['tab-btn', activeTab === tab.key && 'active']"
                  @click="activeTab = tab.key"
                >
                  {{ tab.label }}
                  <span v-if="tabUnread(tab.key) > 0" class="tab-badge">{{ tabUnread(tab.key) }}</span>
                </button>
              </div>

              <!-- Chat list -->
              <div class="chat-list">
                <ChatListItem
                  v-for="chat in filteredChats"
                  :key="chat.id"
                  :chat="chat"
                  :isActive="activeChat?.id === chat.id"
                  @select="selectChatHandler(chat)"
                />
                <div v-if="filteredChats.length === 0" class="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Sin chats</p>
                </div>
              </div>
            </div>

            <!-- ── Right panel: detail ──────────────────────── -->
            <div class="panel-detail" :class="{ 'show-mobile': !!activeChat }">
              <Transition name="detail-fade" mode="out-in">
                <ChatDetail
                  v-if="activeChat"
                  :key="activeChat.id"
                  :chat="activeChat"
                  :showBack="true"
                  @send="(text) => sendMessage(activeChat!.id, text)"
                  @back="activeChat = null"
                />
                <div v-else class="empty-detail">
                  <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p class="empty-title">Selecciona un chat</p>
                  <p class="empty-sub">Elige una conversación para comenzar</p>
                </div>
              </Transition>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useChats } from '../../composables/useChats'
import ChatListItem from './ChatListItem.vue'
import ChatDetail from './ChatDetail.vue'

defineProps<{ modelValue: boolean }>()
defineEmits(['update:modelValue'])

const { allChats, groupChats, directChats, activeChat, selectChat, sendMessage } = useChats()

const search = ref('')
const activeTab = ref<'all' | 'groups'>('all')

const tabs = [
  { key: 'all' as const,    label: 'Todos' },
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
  return list.reduce((sum: number, c: { unread: number }) => sum + c.unread, 0)
}

function selectChatHandler(chat: any) {
  selectChat(chat)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

/* ── Backdrop ────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 24px 24px 0 0;
}

/* ── Container ───────────────────────────────────── */
.modal-container {
  width: 720px;
  max-width: calc(100vw - 32px);
  height: 560px;
  max-height: calc(100vh - 80px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
  display: flex;
  overflow: hidden;
}

/* ── List panel ──────────────────────────────────── */
.panel-list {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f2f5;
  background: #fff;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  flex-shrink: 0;
}
.panel-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1c1e21;
  margin: 0;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.icon-btn {
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border: none;
  background: none;
  cursor: pointer;
  color: #65676b;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  text-decoration: none;
}
.icon-btn:hover { background: #f0f2f5; color: #202d59; }

/* Tooltip */
.tooltip-wrap {
  position: relative;
  display: inline-flex;
}
.tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1c1e21;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
  transform: translateX(-50%) translateY(4px);
}
.tooltip-wrap:hover .tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.tooltip::after {
  content: '';
  position: absolute;
  top: 100%; left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1c1e21;
}

/* Search */
.search-wrap {
  position: relative;
  margin: 0 12px 8px;
  flex-shrink: 0;
}
.search-icon {
  position: absolute;
  left: 10px; top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px;
  color: #b0b3b8;
}
.search-input {
  width: 100%;
  padding: 7px 12px 7px 32px;
  border-radius: 10px;
  border: 1.5px solid #e4e6ea;
  background: #f8f9fb;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #202d59; background: #fff; }

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  padding: 0 12px 8px;
  flex-shrink: 0;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1.5px solid transparent;
  background: transparent;
  color: #65676b;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { background: #f0f2f5; }
.tab-btn.active {
  background: linear-gradient(135deg, rgba(32,45,89,0.08), rgba(163,30,34,0.08));
  border-color: rgba(32,45,89,0.2);
  color: #202d59;
}
.tab-badge {
  min-width: 16px; height: 16px;
  padding: 0 4px;
  background: linear-gradient(135deg, #202d59, #a31e22);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  border-radius: 20px;
  display: flex; align-items: center; justify-content: center;
}

/* Chat list */
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.08) transparent;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #b0b3b8;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
}

/* ── Detail panel ────────────────────────────────── */
.panel-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.empty-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #f8f9fb;
}
.empty-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(32,45,89,0.08), rgba(163,30,34,0.08));
  display: flex; align-items: center; justify-content: center;
  color: #202d59;
  margin-bottom: 4px;
}
.empty-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #1c1e21;
  margin: 0;
}
.empty-sub {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #b0b3b8;
  margin: 0;
}

/* ── Transitions ─────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.modal-slide-leave-active { animation: modalOut 0.2s ease forwards; }
@keyframes modalIn  { from { opacity: 0; transform: translateY(20px) scale(0.97); } }
@keyframes modalOut { to   { opacity: 0; transform: translateY(12px) scale(0.98); } }

.detail-fade-enter-active { animation: detailIn 0.2s ease; }
.detail-fade-leave-active { animation: detailIn 0.15s ease reverse; }
@keyframes detailIn { from { opacity: 0; transform: translateX(8px); } }

/* ── Mobile responsive ───────────────────────────── */
@media (max-width: 600px) {
  .modal-backdrop { padding: 0; align-items: flex-end; justify-content: center; }
  .modal-container {
    width: 100%;
    max-width: 100%;
    height: 90vh;
    border-radius: 20px 20px 0 0;
  }
  .panel-list { width: 100%; }
  .panel-list.hide-mobile { display: none; }
  .panel-detail { display: none; }
  .panel-detail.show-mobile { display: flex; width: 100%; }
}
</style>