<template>
  <Transition name="panel-slide">
    <div v-if="modelValue" class="info-panel">
      <!-- Header -->
      <div class="ip-header">
        <button class="ip-close" @click="$emit('update:modelValue', false)">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h3 class="ip-title">Info del grupo</h3>
      </div>

      <div class="ip-body">
        <!-- Avatar + nombre -->
        <div class="ip-hero">
          <div class="ip-avatar" :style="{ background: groupColor }">
            <img v-if="chat.avatarUrl" :src="chat.avatarUrl" class="ip-avatar-img" />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="ip-hero-text">
            <p class="ip-name">{{ chat.name }}</p>
            <p class="ip-meta">
              <span class="privacy-pill" :class="chat.privacy">
                {{ chat.privacy === 'public' ? '🌐 Público' : '🔒 Privado' }}
              </span>
              · {{ activeMembers.length }} miembros
            </p>
          </div>
        </div>

        <!-- Descripción -->
        <div v-if="chat.description" class="ip-desc">
          <p>{{ chat.description }}</p>
        </div>

        <!-- Tabs de sección -->
        <div class="ip-tabs">
          <button v-for="tab in tabs" :key="tab.key"
            :class="['ip-tab', activeTab === tab.key && 'active']"
            @click="activeTab = tab.key">
            {{ tab.label }}
            <span v-if="tab.key === ('requests' as string) && pendingRequests.length > 0" class="req-badge">
              {{ pendingRequests.length }}
            </span>
          </button>
        </div>

        <!-- Miembros -->
        <div v-if="activeTab === 'members'" class="ip-list">
          <div v-for="member in activeMembers" :key="member.id" class="ip-member">
            <div class="member-avatar">
              <img v-if="member.user?.photo" :src="member.user.photo" :alt="member.user.fullName" />
              <span v-else>{{ initials(member.user?.fullName) }}</span>
            </div>
            <div class="member-info">
              <span class="member-name">{{ member.user?.fullName }}</span>
              <span class="member-role" :class="member.role">
                {{ member.role === 'admin' ? '⭐ Admin' : 'Miembro' }}
              </span>
            </div>
            <!-- Acciones de admin -->
            <div v-if="isCurrentUserAdmin && member.userId !== currentUserId" class="member-actions">
              <button v-if="member.role === 'member'" class="ma-btn" title="Hacer admin"
                @click="$emit('set-admin', member.userId)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </button>
              <button v-else class="ma-btn demote" title="Quitar admin"
                @click="$emit('demote-admin', member.userId)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
              </button>
              <button class="ma-btn remove" title="Expulsar"
                @click="$emit('remove-member', member.userId)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Solicitudes pendientes -->
        <div v-if="activeTab === 'requests'" class="ip-list">
          <div v-if="loadingRequests" class="ip-loading">
            <div class="spinner" />
          </div>
          <div v-else-if="pendingRequests.length === 0" class="ip-empty">
            No hay solicitudes pendientes
          </div>
          <div v-else v-for="req in pendingRequests" :key="req.id" class="ip-request">
            <div class="member-avatar">
              <img v-if="req.user?.photo" :src="req.user.photo" :alt="req.user.fullName" />
              <span v-else>{{ initials(req.user?.fullName) }}</span>
            </div>
            <div class="member-info">
              <span class="member-name">{{ req.user?.fullName }}</span>
              <span class="req-time">{{ formatDate(req.createdAt) }}</span>
            </div>
            <div class="req-actions">
              <button class="rq-btn accept" @click="$emit('accept-request', req.id)">✓</button>
              <button class="rq-btn reject" @click="$emit('reject-request', req.id)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer: salir del grupo -->
      <div class="ip-footer">
        <button class="leave-btn" @click="$emit('leave')">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir del grupo
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Chat, JoinRequest } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'
import { chatService } from '~/services/chat.service'

const props = defineProps<{
  modelValue: boolean
  chat: Chat
}>()

defineEmits(['update:modelValue', 'set-admin', 'demote-admin', 'remove-member', 'leave', 'accept-request', 'reject-request'])

const { user } = useUser()
const currentUserId = computed(() => user.value?.id)

const activeTab = ref<'members' | 'requests'>('members')
const pendingRequests = ref<JoinRequest[]>([])
const loadingRequests = ref(false)

const tabs = computed(() => {
  const base = [{ key: 'members' as "members" | "requests", label: 'Miembros' }]
  if (isCurrentUserAdmin.value) base.push({ key: 'requests' as "members" | "requests", label: 'Solicitudes' })
  return base
})

const activeMembers = computed(() =>
  props.chat.members?.filter(m => !m.hasLeft) ?? []
)

const isCurrentUserAdmin = computed(() =>
  activeMembers.value.some(m => m.userId === currentUserId.value && m.role === 'admin')
)

const groupColor = computed(() => {
  const colors = ['#202d59', '#a31e22', '#1e5f74', '#2d6a4f', '#6a2d8f']
  const name = props.chat.name ?? ''
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
})

watch(() => [props.modelValue, activeTab.value], async ([open, tab]) => {
  if (open && tab === 'requests' && isCurrentUserAdmin.value) {
    loadingRequests.value = true
    try {
      pendingRequests.value = await chatService.getPendingRequests(props.chat.id)
    } finally {
      loadingRequests.value = false
    }
  }
})

// Se llama desde el padre cuando se acepta/rechaza para refrescar
async function refreshRequests() {
  if (!isCurrentUserAdmin.value) return
  pendingRequests.value = await chatService.getPendingRequests(props.chat.id)
}

defineExpose({ refreshRequests })

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.info-panel {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: 300px; background: #fff;
  border-left: 1px solid #eaecef;
  display: flex; flex-direction: column;
  z-index: 10; box-shadow: -8px 0 32px rgba(0,0,0,0.08);
  font-family: 'DM Sans', sans-serif;
}

.ip-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid #f0f2f5; flex-shrink: 0;
}
.ip-close {
  background: none; border: none; cursor: pointer; color: #65676b;
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; transition: background 0.15s;
}
.ip-close:hover { background: #f0f2f5; }
.ip-title { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #1c1e21; margin: 0; }

.ip-body { flex: 1; overflow-y: auto; padding: 0 0 8px; }

.ip-hero { display: flex; align-items: center; gap: 12px; padding: 16px; }
.ip-avatar {
  width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.ip-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.ip-name { font-size: 0.95rem; font-weight: 700; color: #1c1e21; margin: 0 0 4px; }
.ip-meta { font-size: 0.75rem; color: #65676b; margin: 0; display: flex; align-items: center; gap: 4px; }
.privacy-pill {
  padding: 2px 6px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
}
.privacy-pill.public { background: #dcfce7; color: #16a34a; }
.privacy-pill.private { background: #fef3c7; color: #d97706; }

.ip-desc { padding: 0 16px 12px; font-size: 0.82rem; color: #65676b; line-height: 1.5; }

.ip-tabs { display: flex; gap: 4px; padding: 0 12px 8px; border-bottom: 1px solid #f0f2f5; flex-shrink: 0; }
.ip-tab {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600; border: 1.5px solid transparent;
  background: transparent; color: #65676b; cursor: pointer; transition: all 0.2s;
}
.ip-tab:hover { background: #f0f2f5; }
.ip-tab.active { background: rgba(32,45,89,0.08); border-color: rgba(32,45,89,0.2); color: #202d59; }
.req-badge {
  min-width: 16px; height: 16px; padding: 0 4px;
  background: #a31e22; color: #fff; font-size: 0.62rem; font-weight: 700;
  border-radius: 20px; display: flex; align-items: center; justify-content: center;
}

.ip-list { padding: 8px 0; }
.ip-member, .ip-request {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 16px; transition: background 0.15s;
}
.ip-member:hover, .ip-request:hover { background: #f8f9fb; }

.member-avatar {
  width: 34px; height: 34px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: linear-gradient(135deg, #202d59, #a31e22);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.7rem; font-weight: 700;
}
.member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-info { flex: 1; min-width: 0; }
.member-name { display: block; font-size: 0.82rem; font-weight: 600; color: #1c1e21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.member-role { font-size: 0.7rem; color: #65676b; }
.member-role.admin { color: #d97706; }
.req-time { font-size: 0.7rem; color: #b0b3b8; }

.member-actions { display: flex; gap: 4px; }
.ma-btn {
  width: 26px; height: 26px; border-radius: 6px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: #f0f2f5; color: #65676b; transition: all 0.15s;
}
.ma-btn:hover { background: #e4e6ea; color: #202d59; }
.ma-btn.remove:hover { background: #fee2e2; color: #dc2626; }
.ma-btn.demote:hover { background: #fef3c7; color: #d97706; }

.req-actions { display: flex; gap: 6px; }
.rq-btn {
  width: 28px; height: 28px; border-radius: 8px; border: none; cursor: pointer;
  font-weight: 700; font-size: 0.8rem; transition: all 0.15s;
}
.rq-btn.accept { background: #dcfce7; color: #16a34a; }
.rq-btn.accept:hover { background: #16a34a; color: #fff; }
.rq-btn.reject { background: #fee2e2; color: #dc2626; }
.rq-btn.reject:hover { background: #dc2626; color: #fff; }

.ip-loading, .ip-empty { padding: 24px; text-align: center; color: #b0b3b8; font-size: 0.82rem; }
.spinner { width: 24px; height: 24px; border: 2px solid #e4e6ea; border-top-color: #202d59; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }

.ip-footer { padding: 12px 16px; border-top: 1px solid #f0f2f5; flex-shrink: 0; }
.leave-btn {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px;
  border-radius: 10px; border: 1.5px solid #fee2e2; background: transparent;
  color: #dc2626; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.leave-btn:hover { background: #fee2e2; }

.panel-slide-enter-active { animation: slideIn 0.25s ease; }
.panel-slide-leave-active { animation: slideIn 0.2s ease reverse; }
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } }
</style>