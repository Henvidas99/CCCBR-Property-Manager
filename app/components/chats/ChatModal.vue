<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal-container">

            <!-- ── Left panel ──────────────────────────────── -->
            <div class="panel-list" :class="{ 'hide-mobile': !!activeChat }">
              <div class="panel-header">
                <h2 class="panel-title">Mensajes</h2>
                <div class="header-actions">
                  <div class="tooltip-wrap">
                    <NuxtLink to="/chats" class="icon-btn" @click="$emit('update:modelValue', false)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                      </svg>
                    </NuxtLink>
                    <span class="tooltip">Ver completo</span>
                  </div>
                  <button class="icon-btn" @click="$emit('update:modelValue', false)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="search-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="search" placeholder="Buscar chats…" class="search-input"/>
              </div>

              <div class="tabs">
                <button v-for="tab in tabs" :key="tab.key"
                  :class="['tab-btn', activeTab === tab.key && 'active']"
                  @click="activeTab = tab.key as 'all' | 'groups' | 'discover'">
                  {{ tab.label }}
                  <span v-if="tab.key !== 'discover' && tabUnread(tab.key as any) > 0" class="tab-badge">
                    {{ tabUnread(tab.key as any) }}
                  </span>
                </button>
              </div>

              <div class="chat-list">
                <template v-if="activeTab !== 'discover'">
                  <ChatListItem v-for="chat in filteredChats" :key="chat.id" :chat="chat"
                    :isActive="activeChat?.id === chat.id" @select="handleSelect(chat)"/>
                  <div v-if="filteredChats.length === 0" class="empty-state">
                    <p>Sin chats</p>
                  </div>
                </template>
                <DiscoverGroups v-else :available-groups="discoverGroups" :loading="loadingDiscover"
                  @joined="onJoined" @requested="onRequested"/>
              </div>
            </div>

            <!-- ── Right panel ─────────────────────────────── -->
            <div class="panel-detail" :class="{ 'show-mobile': !!activeChat }">
              <Transition name="detail-fade" mode="out-in">
                <ChatDetail v-if="activeChat" :key="activeChat.id" :chat="activeChat"
                  :showBack="true" @back="activeChat = null" @leave="handleLeave"/>
                <div v-else class="empty-detail">
                  <div class="empty-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
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
import { ref, computed, watch } from 'vue'
import { useChats } from '~/composables/useChats'
import { chatService, type Chat } from '~/services/chat.service'
import ChatListItem from './ChatListItem.vue'
import ChatDetail from './ChatDetail.vue'
import DiscoverGroups from './DiscoverGroups.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const { allChats, groupChats, activeChat, selectChat, leaveGroup, fetchChats } = useChats()

const search = ref('')
const activeTab = ref<'all' | 'groups' | 'discover'>('all')
const discoverGroups = ref<Chat[]>([])
const loadingDiscover = ref(false)

const tabs = [
  { key: 'all', label: 'Todos' },
  { key: 'groups', label: 'Grupos' },
  { key: 'discover', label: 'Descubrir' },
]

const baseList = computed(() => activeTab.value === 'groups' ? groupChats.value : allChats.value)
const filteredChats = computed(() =>
  search.value ? baseList.value.filter(c =>
    (c.name ?? '').toLowerCase().includes(search.value.toLowerCase())
  ) : baseList.value
)

function tabUnread(key: 'all' | 'groups') {
  const list = key === 'all' ? allChats.value : groupChats.value
  return list.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
}

async function loadDiscoverGroups() {
  loadingDiscover.value = true
  try {
    // Traemos todos los grupos públicos — el backend debería tener un endpoint para esto
    // Por ahora filtramos los que el usuario NO es miembro
    const all = await chatService.getMyChats()
    const myIds = new Set(allChats.value.map(c => c.id))
    discoverGroups.value = all.filter(c => c.type === 'group' && !myIds.has(c.id))
  } catch {
    discoverGroups.value = []
  } finally {
    loadingDiscover.value = false
  }
}

watch(activeTab, (val) => { if (val === 'discover') loadDiscoverGroups() })
watch(() => props.modelValue, (val) => { if (val) fetchChats() })

async function handleSelect(chat: Chat) {
  await selectChat(chat)
}

async function handleLeave() {
  if (!activeChat.value) return
  await leaveGroup(activeChat.value.id)
}

function onJoined(group: Chat) {
  activeTab.value = 'all'
}

function onRequested(group: Chat) {
  // feedback visual si se quiere
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

.modal-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: flex-start; justify-content: flex-end; padding: 24px 24px 0 0; }
.modal-container { width: 720px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 80px); background: #fff; border-radius: 20px; box-shadow: 0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05); display: flex; overflow: hidden; }

.panel-list { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; border-right: 1px solid #f0f2f5; background: #fff; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 10px; flex-shrink: 0; }
.panel-title { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 800; color: #1c1e21; margin: 0; }
.header-actions { display: flex; align-items: center; gap: 6px; }
.icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: none; background: none; cursor: pointer; color: #65676b; border-radius: 8px; transition: all 0.15s; text-decoration: none; }
.icon-btn:hover { background: #f0f2f5; color: #202d59; }
.tooltip-wrap { position: relative; display: inline-flex; }
.tooltip { position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%) translateY(4px); background: #1c1e21; color: #fff; font-size: 0.7rem; font-weight: 500; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none; opacity: 0; transition: all 0.15s; }
.tooltip-wrap:hover .tooltip { opacity: 1; transform: translateX(-50%) translateY(0); }
.tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 4px solid transparent; border-top-color: #1c1e21; }

.search-wrap { position: relative; margin: 0 12px 8px; flex-shrink: 0; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #b0b3b8; }
.search-input { width: 100%; padding: 7px 12px 7px 32px; border-radius: 10px; border: 1.5px solid #e4e6ea; background: #f8f9fb; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; outline: none; transition: border-color 0.2s; }
.search-input:focus { border-color: #202d59; background: #fff; }

.tabs { display: flex; gap: 4px; padding: 0 12px 8px; flex-shrink: 0; }
.tab-btn { display: flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 600; border: 1.5px solid transparent; background: transparent; color: #65676b; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { background: #f0f2f5; }
.tab-btn.active { background: rgba(32,45,89,0.08); border-color: rgba(32,45,89,0.2); color: #202d59; }
.tab-badge { min-width: 16px; height: 16px; padding: 0 4px; background: linear-gradient(135deg, #202d59, #a31e22); color: #fff; font-size: 0.62rem; font-weight: 700; border-radius: 20px; display: flex; align-items: center; justify-content: center; }

.chat-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.08) transparent; display: flex; flex-direction: column; }
.empty-state { display: flex; align-items: center; justify-content: center; flex: 1; color: #b0b3b8; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; }

.panel-detail { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.empty-detail { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 20px; background: #f8f9fb; }
.empty-icon { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, rgba(32,45,89,0.08), rgba(163,30,34,0.08)); display: flex; align-items: center; justify-content: center; color: #202d59; }
.empty-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #1c1e21; margin: 0; }
.empty-sub { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #b0b3b8; margin: 0; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-slide-enter-active { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.modal-slide-leave-active { animation: modalOut 0.2s ease forwards; }
@keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } }
@keyframes modalOut { to { opacity: 0; transform: translateY(12px) scale(0.98); } }
.detail-fade-enter-active { animation: detailIn 0.2s ease; }
.detail-fade-leave-active { animation: detailIn 0.15s ease reverse; }
@keyframes detailIn { from { opacity: 0; transform: translateX(8px); } }

@media (max-width: 600px) {
  .modal-backdrop { padding: 0; align-items: flex-end; justify-content: center; }
  .modal-container { width: 100%; max-width: 100%; height: 90vh; border-radius: 20px 20px 0 0; }
  .panel-list { width: 100%; }
  .panel-list.hide-mobile { display: none; }
  .panel-detail { display: none; }
  .panel-detail.show-mobile { display: flex; width: 100%; }
}
</style>