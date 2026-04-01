<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">Asociados</h3>
      <span class="online-badge">
        <span class="online-dot" />
        {{ onlineCount }} en línea
      </span>
    </div>

    <!-- Search -->
    <div class="search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input v-model="search" class="search-input" placeholder="Buscar asociado…" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="user-list">
      <div v-for="n in 5" :key="n" class="user-skeleton">
        <div class="skel-avatar" />
        <div class="skel-lines">
          <div class="skel-line skel-line--wide" />
          <div class="skel-line skel-line--narrow" />
        </div>
      </div>
    </div>

    <div v-else class="user-list">

      <!-- Online section -->
      <template v-if="onlineFiltered.length">
        <p class="section-label">En línea</p>
        <button
          v-for="u in onlineFiltered"
          :key="u.id"
          class="user-row"
          @click="goToProfile(u.id)"
        >
          <div class="user-avatar-wrap">
            <img
              :src="u.photo || fallback(u.fullName)"
              :alt="u.fullName"
              class="user-avatar"
              @error="(e) => ((e.target as HTMLImageElement).src = fallback(u.fullName))"
            />
            <span class="status-dot status-dot--online" />
          </div>
          <div class="user-info">
            <span class="user-name">{{ u.fullName }}</span>
            <span class="user-sub">{{ u.position || 'Asociado' }}</span>
          </div>
          <!-- Direct chat shortcut -->
          <button class="chat-btn" @click.stop="startChat(u.id)" title="Mensaje directo">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </button>
        </button>
      </template>

      <!-- Offline / recent section -->
      <template v-if="offlineFiltered.length">
        <p class="section-label">Recientes</p>
        <button
          v-for="u in offlineFiltered"
          :key="u.id"
          class="user-row"
          @click="goToProfile(u.id)"
        >
          <div class="user-avatar-wrap">
            <img
              :src="u.photo || fallback(u.fullName)"
              :alt="u.fullName"
              class="user-avatar user-avatar--offline"
              @error="(e) => ((e.target as HTMLImageElement).src = fallback(u.fullName))"
            />
            <span class="status-dot status-dot--offline" />
          </div>
          <div class="user-info">
            <span class="user-name">{{ u.fullName }}</span>
            <span class="user-sub">{{ formatLastSeenAt(u.lastSeenAt) }}</span>
          </div>
          <button class="chat-btn" @click.stop="startChat(u.id)" title="Mensaje directo">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </button>
        </button>
      </template>

      <!-- Empty -->
      <div v-if="!onlineFiltered.length && !offlineFiltered.length" class="empty-users">
        No se encontraron asociados
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from '~/composables/useUser'
import { useChats } from '~/composables/useChats'
import type { UserProfile } from '~/services/user.service'
import { formatLastSeenAt } from '~/helpers/global.helpers'

const router = useRouter()
const { users, user: currentUser, fetchAllUsers, loading } = useUser()
const { onlineUsers, createDirectChat, selectChat } = useChats()

const search = ref('')

onMounted(() => fetchAllUsers())

// ── Computed ──────────────────────────────────────────────────────────────────

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return users.value.filter(u =>
    u.id !== currentUser.value?.id &&
    (!q || u.fullName.toLowerCase().includes(q) || u.position?.toLowerCase().includes(q)),
  )
})

const onlineFiltered = computed(() =>
  filtered.value.filter(u => onlineUsers.value.has(u.id)),
)

const offlineFiltered = computed(() =>
  filtered.value
    .filter(u => !onlineUsers.value.has(u.id))
    .slice(0, 15), // limitamos para no sobrecargar
)

const onlineCount = computed(() =>
  users.value.filter(u => u.id !== currentUser.value?.id && onlineUsers.value.has(u.id)).length,
)

// ── Helpers ───────────────────────────────────────────────────────────────────

function fallback(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=202d59`
}

function goToProfile(userId: number) {
  router.push(`/asociados/${userId}?id=${userId}`)
}

async function startChat(userId: number) {
  const chat = await createDirectChat(userId)
  if (chat) {
    await selectChat(chat)
    router.push('/chats')
  }
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 8px rgba(0,0,0,.07);
  border: 1px solid rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f0f2f5;
}
.sidebar-title {
  font-weight: 700;
  font-size: .925rem;
  color: #1c1e21;
}
.online-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .72rem;
  font-weight: 600;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 3px 8px;
  border-radius: 20px;
}
.online-dot {
  width: 6px; height: 6px;
  background: #16a34a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

/* Search */
.search-wrap {
  position: relative;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f2f5;
}
.search-icon {
  position: absolute;
  left: 20px; top: 50%;
  transform: translateY(-50%);
  width: 15px; height: 15px;
  color: #b0b3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 7px 10px 7px 32px;
  border-radius: 20px;
  border: 1.5px solid #e4e6ea;
  font-size: .8rem;
  outline: none;
  background: #f8f9fb;
  transition: border-color .2s;
  font-family: inherit;
}
.search-input:focus {
  border-color: #202d59;
  background: #fff;
}

/* User list */
.user-list {
  overflow-y: auto;
  flex: 1;
  padding: 8px 0;
  scrollbar-width: thin;
  scrollbar-color: #e4e6ea transparent;
}

.section-label {
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #b0b3b8;
  padding: 6px 14px 4px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
  border-radius: 0;
  font-family: inherit;
}
.user-row:hover {
  background: #f8f9fb;
}
.user-row:hover .chat-btn {
  opacity: 1;
}

.user-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.user-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
}
.user-avatar--offline { filter: grayscale(30%); opacity: .85; }

.status-dot {
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
}
.status-dot--online  { background: #16a34a; }
.status-dot--offline { background: #d1d5db; }

.user-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.user-name {
  font-size: .825rem;
  font-weight: 600;
  color: #1c1e21;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.user-sub {
  font-size: .7rem;
  color: #b0b3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-btn {
  opacity: 0;
  flex-shrink: 0;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  border: 1.5px solid rgba(32,45,89,.15);
  background: transparent;
  color: #202d59;
  cursor: pointer;
  transition: all .15s;
}
.chat-btn:hover {
  background: rgba(32,45,89,.07);
  border-color: #202d59;
}

/* Skeleton */
.user-skeleton {
  display: flex; gap: 10px; align-items: center;
  padding: 8px 14px;
}
.skel-avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skel-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.skel-line {
  height: 10px; border-radius: 5px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e4e6ea 50%, #f0f2f5 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
.skel-line--wide  { width: 65%; }
.skel-line--narrow { width: 40%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-users {
  text-align: center;
  padding: 24px 16px;
  font-size: .8rem;
  color: #b0b3b8;
}
</style>