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
          <div class="ip-avatar-wrap">
            <div class="ip-avatar" :style="{ background: groupColor }">
              <img v-if="chat.avatarUrl" :src="chat.avatarUrl" class="ip-avatar-img" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="white">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <!-- Avatar upload overlay (admin only) -->
            <label v-if="isCurrentUserAdmin" class="avatar-upload-label" title="Cambiar imagen">
              <input type="file" accept="image/*" class="hidden-file" @change="onAvatarChange" />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span v-if="uploadingAvatar" class="avatar-uploading-spinner"/>
            </label>
          </div>

          <div class="ip-hero-text">
            <!-- Edit name inline (admin) -->
            <template v-if="isCurrentUserAdmin && editingInfo">
              <input v-model="editForm.name" class="ip-name-input" placeholder="Nombre del grupo" maxlength="100" />
            </template>
            <p v-else class="ip-name">{{ chat.name }}</p>
            <p class="ip-meta">
              <span class="privacy-pill" :class="chat.privacy">
                {{ chat.privacy === 'public' ? '🌐 Público' : '🔒 Privado' }}
              </span>
              · {{ activeMembers.length }} miembros
            </p>
          </div>

          <!-- Edit toggle -->
          <button v-if="isCurrentUserAdmin" class="edit-info-btn" :class="{ active: editingInfo }"
            @click="toggleEditInfo" :title="editingInfo ? 'Guardar' : 'Editar info'">
            <svg v-if="!editingInfo" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </button>
        </div>

        <!-- Edit description + privacy -->
        <div v-if="isCurrentUserAdmin && editingInfo" class="edit-section">
          <textarea v-model="editForm.description" class="ip-desc-input" placeholder="Descripción del grupo…" rows="2" maxlength="300"/>
          <div class="privacy-toggle">
            <button :class="['ptab', editForm.privacy === 'public' && 'active']" @click="editForm.privacy = 'public'">
              🌐 Público
            </button>
            <button :class="['ptab', editForm.privacy === 'private' && 'active']" @click="editForm.privacy = 'private'">
              🔒 Privado
            </button>
          </div>
          <div class="edit-actions">
            <button class="edit-cancel-btn" @click="cancelEditInfo">Cancelar</button>
            <button class="edit-save-btn" :disabled="savingInfo || !editForm.name.trim()" @click="saveInfo">
              <span v-if="savingInfo" class="btn-spinner-sm"/>
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </div>

        <!-- Descripción (read-only) -->
        <div v-else-if="chat.description" class="ip-desc">
          <p>{{ chat.description }}</p>
        </div>

        <!-- Tabs de sección -->
        <div class="ip-tabs">
          <button v-for="tab in tabs" :key="tab.key"
            :class="['ip-tab', activeTab === tab.key && 'active']"
            @click="activeTab = tab.key">
            {{ tab.label }}
            <span v-if="tab.key === 'requests' && pendingRequests.length > 0" class="req-badge">
              {{ pendingRequests.length }}
            </span>
          </button>
        </div>

        <!-- ── Miembros ── -->
        <div v-if="activeTab === 'members'" class="ip-list">
          <!-- Add member button (admin only) -->
          <button v-if="isCurrentUserAdmin" class="add-member-btn" @click="showAddMember = !showAddMember">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Agregar miembro
          </button>

          <!-- Add member search panel -->
          <Transition name="expand">
            <div v-if="showAddMember && isCurrentUserAdmin" class="add-member-panel">
              <div class="search-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="addMemberSearch" class="search-input" placeholder="Buscar usuario…" />
              </div>
              <div class="add-member-list">
                <div v-if="loadingUsers" class="add-member-loading">
                  <span class="btn-spinner-sm inline-spinner"/>
                  Cargando usuarios…
                </div>
                <button
                  v-for="u in filteredAddUsers"
                  :key="u.id"
                  class="add-member-row"
                  :disabled="addingMember === u.id"
                  @click="addMember(u)"
                >
                  <div class="sm-avatar">
                    <img v-if="u.photo" :src="u.photo" :alt="u.fullName"/>
                    <span v-else>{{ initials(u.fullName) }}</span>
                  </div>
                  <span class="sm-name">{{ u.fullName }}</span>
                  <span v-if="addingMember === u.id" class="btn-spinner-sm"/>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 add-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
                <div v-if="filteredAddUsers.length === 0 && !loadingUsers" class="add-member-empty">
                  {{ addMemberSearch ? 'No se encontró ningún usuario' : 'Escribe para buscar' }}
                </div>
              </div>
            </div>
          </Transition>

          <!-- Member list -->
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
                @click="confirmSetAdmin(member)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </button>
              <button v-else class="ma-btn demote" title="Quitar admin"
                @click="confirmDemoteAdmin(member)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
              </button>
              <button class="ma-btn remove" title="Expulsar"
                @click="confirmRemoveMember(member)">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Solicitudes pendientes ── -->
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
              <button class="rq-btn accept" :disabled="processingRequest === req.id" @click="handleAccept(req.id)">
                <span v-if="processingRequest === req.id" class="btn-spinner-sm"/>
                <span v-else>✓</span>
              </button>
              <button class="rq-btn reject" :disabled="processingRequest === req.id" @click="handleReject(req.id)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer: salir del grupo -->
      <div class="ip-footer">
        <button class="leave-btn" @click="confirmLeave">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir del grupo
        </button>
      </div>
    </div>
  </Transition>

  <!-- ── Confirmation Dialog ── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="dialog.show" class="dialog-backdrop" @click.self="dialog.show = false">
        <Transition name="dialog-pop">
          <div v-if="dialog.show" class="dialog-box">
            <div class="dialog-icon" :class="dialog.type">
              <svg v-if="dialog.type === 'danger'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h4 class="dialog-title">{{ dialog.title }}</h4>
            <p class="dialog-msg">{{ dialog.message }}</p>
            <div class="dialog-actions">
              <button class="dialog-cancel" @click="dialog.show = false">Cancelar</button>
              <button :class="['dialog-confirm', dialog.type]" @click="runDialogAction">
                {{ dialog.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Chat, ChatMember, JoinRequest } from '~/composables/useChats'
import { useUser } from '~/composables/useUser'
import { chatService } from '~/services/chat.service'

const props = defineProps<{
  modelValue: boolean
  chat: Chat
}>()

const emit = defineEmits([
  'update:modelValue',
  'set-admin',
  'demote-admin',
  'remove-member',
  'leave',
  'accept-request',
  'reject-request',
  'chat-updated',
])

const { user, users, fetchAllUsers } = useUser()
const currentUserId = computed(() => user.value?.id)

// ── State ──────────────────────────────────────────────────────────────
const activeTab = ref<'members' | 'requests'>('members')
const pendingRequests = ref<JoinRequest[]>([])
const loadingRequests = ref(false)
const processingRequest = ref<string | null>(null)

const editingInfo = ref(false)
const savingInfo = ref(false)
const editForm = ref({ name: '', description: '', privacy: 'public' as 'public' | 'private' })

const uploadingAvatar = ref(false)

const showAddMember = ref(false)
const addMemberSearch = ref('')
const addingMember = ref<number | null>(null)
const loadingUsers = ref(false)

const dialog = ref({
  show: false,
  type: 'danger' as 'danger' | 'info',
  title: '',
  message: '',
  confirmLabel: '',
  action: () => {},
})

// ── Computed ────────────────────────────────────────────────────────────
const activeMembers = computed(() => props.chat.members?.filter(m => !m.hasLeft) ?? [])

const isCurrentUserAdmin = computed(() =>
  activeMembers.value.some(m => m.userId === currentUserId.value && m.role === 'admin')
)

const groupColor = computed(() => {
  const colors = ['#202d59', '#a31e22', '#1e5f74', '#2d6a4f', '#6a2d8f']
  const name = props.chat.name ?? ''
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
})

const tabs = computed(() => {
  const base: { key: 'members' | 'requests'; label: string }[] = [
    { key: 'members', label: 'Miembros' },
  ]
  if (isCurrentUserAdmin.value) base.push({ key: 'requests', label: 'Solicitudes' })
  return base
})

// Users not already in the group
const filteredAddUsers = computed(() => {
  const memberIds = new Set(activeMembers.value.map(m => m.userId))
  const filtered = users.value.filter(u => !memberIds.has(u.id) && u.id !== currentUserId.value)
  if (!addMemberSearch.value.trim()) return filtered.slice(0, 6)
  const q = addMemberSearch.value.toLowerCase()
  return filtered.filter(u => u.fullName.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 8)
})

// ── Watchers ────────────────────────────────────────────────────────────
watch(() => [props.modelValue, activeTab.value], async ([open, tab]) => {
  if (open && tab === 'requests' && isCurrentUserAdmin.value) {
    await loadPendingRequests()
  }
})

watch(() => showAddMember.value, async (val) => {
  if (val && !users.value.length) {
    loadingUsers.value = true
    await fetchAllUsers()
    loadingUsers.value = false
  }
})

// ── Methods ─────────────────────────────────────────────────────────────
async function loadPendingRequests() {
  loadingRequests.value = true
  try {
    pendingRequests.value = await chatService.getPendingRequests(props.chat.id)
  } finally {
    loadingRequests.value = false
  }
}

async function refreshRequests() {
  if (!isCurrentUserAdmin.value) return
  pendingRequests.value = await chatService.getPendingRequests(props.chat.id)
}

function toggleEditInfo() {
  if (editingInfo.value) {
    saveInfo()
  } else {
    editForm.value = {
      name: props.chat.name ?? '',
      description: props.chat.description ?? '',
      privacy: props.chat.privacy ?? 'public',
    }
    editingInfo.value = true
  }
}

function cancelEditInfo() {
  editingInfo.value = false
}

async function saveInfo() {
  if (!editForm.value.name.trim()) return
  savingInfo.value = true
  try {
    const updated = await chatService.updateGroup(props.chat.id, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || undefined,
      privacy: editForm.value.privacy,
    })
    emit('chat-updated', updated)
    editingInfo.value = false
  } catch (e) {
    console.error('[GroupInfoPanel] saveInfo error', e)
  } finally {
    savingInfo.value = false
  }
}

async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingAvatar.value = true
  try {
    const updated = await chatService.updateGroupAvatar(props.chat.id, file)
    emit('chat-updated', updated)
  } catch (e) {
    console.error('[GroupInfoPanel] onAvatarChange error', e)
  } finally {
    uploadingAvatar.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function addMember(u: { id: number; fullName: string }) {
  addingMember.value = u.id
  try {
    await chatService.addMembers(props.chat.id, [u.id])
    emit('chat-updated', null) // trigger refresh
    showAddMember.value = false
    addMemberSearch.value = ''
  } catch (e) {
    console.error('[GroupInfoPanel] addMember error', e)
  } finally {
    addingMember.value = null
  }
}

function confirmSetAdmin(member: ChatMember) {
  dialog.value = {
    show: true,
    type: 'info',
    title: 'Hacer administrador',
    message: `¿Deseas darle permisos de administrador a ${member.user?.fullName}?`,
    confirmLabel: 'Sí, hacer admin',
    action: () => emit('set-admin', member.userId),
  }
}

function confirmDemoteAdmin(member: ChatMember) {
  dialog.value = {
    show: true,
    type: 'danger',
    title: 'Quitar administrador',
    message: `¿Quitar los permisos de administrador a ${member.user?.fullName}?`,
    confirmLabel: 'Quitar admin',
    action: () => emit('demote-admin', member.userId),
  }
}

function confirmRemoveMember(member: ChatMember) {
  dialog.value = {
    show: true,
    type: 'danger',
    title: 'Expulsar miembro',
    message: `¿Seguro que quieres expulsar a ${member.user?.fullName} del grupo?`,
    confirmLabel: 'Expulsar',
    action: () => emit('remove-member', member.userId),
  }
}

function confirmLeave() {
  dialog.value = {
    show: true,
    type: 'danger',
    title: 'Salir del grupo',
    message: '¿Seguro que quieres salir de este grupo? No podrás leer los mensajes anteriores a menos que te vuelvan a agregar.',
    confirmLabel: 'Salir',
    action: () => emit('leave'),
  }
}

function runDialogAction() {
  dialog.value.action()
  dialog.value.show = false
}

async function handleAccept(requestId: string) {
  processingRequest.value = requestId
  try {
    await chatService.respondJoinRequest(props.chat.id, requestId, 'accepted')
    emit('accept-request', requestId)
    await refreshRequests()
  } finally {
    processingRequest.value = null
  }
}

async function handleReject(requestId: string) {
  processingRequest.value = requestId
  try {
    await chatService.respondJoinRequest(props.chat.id, requestId, 'rejected')
    emit('reject-request', requestId)
    await refreshRequests()
  } finally {
    processingRequest.value = null
  }
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

defineExpose({ refreshRequests })
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

/* Hero */
.ip-hero { display: flex; align-items: center; gap: 12px; padding: 16px 16px 12px; }
.ip-avatar-wrap { position: relative; flex-shrink: 0; }
.ip-avatar {
  width: 56px; height: 56px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.ip-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-upload-label {
  position: absolute; inset: 0; border-radius: 14px;
  background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer; opacity: 0; transition: opacity 0.2s;
}
.ip-avatar-wrap:hover .avatar-upload-label { opacity: 1; }
.hidden-file { display: none; }
.avatar-uploading-spinner {
  width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
  display: block;
}

.ip-hero-text { flex: 1; min-width: 0; }
.ip-name { font-size: 0.95rem; font-weight: 700; color: #1c1e21; margin: 0 0 4px; }
.ip-name-input {
  width: 100%; font-size: 0.9rem; font-weight: 700; color: #1c1e21;
  border: 1.5px solid #e4e6ea; border-radius: 8px; padding: 4px 8px;
  outline: none; font-family: 'DM Sans', sans-serif; background: #f8f9fb;
  margin-bottom: 4px;
}
.ip-name-input:focus { border-color: #202d59; background: #fff; }
.ip-meta { font-size: 0.75rem; color: #65676b; margin: 0; display: flex; align-items: center; gap: 4px; }
.privacy-pill { padding: 2px 6px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
.privacy-pill.public { background: #dcfce7; color: #16a34a; }
.privacy-pill.private { background: #fef3c7; color: #d97706; }

.edit-info-btn {
  width: 30px; height: 30px; border-radius: 8px; border: 1.5px solid #e4e6ea;
  background: transparent; cursor: pointer; color: #65676b; display: flex;
  align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s;
}
.edit-info-btn:hover, .edit-info-btn.active { background: rgba(32,45,89,0.08); border-color: #202d59; color: #202d59; }

/* Edit section */
.edit-section { padding: 0 16px 12px; display: flex; flex-direction: column; gap: 8px; }
.ip-desc-input {
  width: 100%; border: 1.5px solid #e4e6ea; border-radius: 8px; padding: 7px 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #1c1e21;
  outline: none; resize: none; background: #f8f9fb; box-sizing: border-box;
}
.ip-desc-input:focus { border-color: #202d59; background: #fff; }
.privacy-toggle { display: flex; gap: 6px; }
.ptab {
  flex: 1; padding: 6px 8px; border-radius: 8px;
  border: 1.5px solid #e4e6ea; background: #f8f9fb;
  font-size: 0.75rem; font-weight: 600; color: #65676b;
  cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.ptab.active { border-color: #202d59; background: rgba(32,45,89,0.07); color: #202d59; }
.edit-actions { display: flex; gap: 6px; }
.edit-cancel-btn {
  flex: 1; padding: 7px; border-radius: 8px; border: 1.5px solid #e4e6ea;
  background: transparent; color: #65676b; font-size: 0.78rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.edit-cancel-btn:hover { background: #f0f2f5; }
.edit-save-btn {
  flex: 2; padding: 7px; border-radius: 8px; border: none;
  background: linear-gradient(135deg, #202d59, #a31e22); color: #fff;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.edit-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.ip-desc { padding: 0 16px 12px; font-size: 0.82rem; color: #65676b; line-height: 1.5; }

/* Tabs */
.ip-tabs { display: flex; gap: 4px; padding: 0 12px 8px; border-bottom: 1px solid #f0f2f5; flex-shrink: 0; }
.ip-tab {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600; border: 1.5px solid transparent;
  background: transparent; color: #65676b; cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.ip-tab:hover { background: #f0f2f5; }
.ip-tab.active { background: rgba(32,45,89,0.08); border-color: rgba(32,45,89,0.2); color: #202d59; }
.req-badge {
  min-width: 16px; height: 16px; padding: 0 4px;
  background: #a31e22; color: #fff; font-size: 0.62rem; font-weight: 700;
  border-radius: 20px; display: flex; align-items: center; justify-content: center;
}

/* Add member */
.add-member-btn {
  display: flex; align-items: center; gap: 6px;
  width: calc(100% - 32px); margin: 8px 16px 4px;
  padding: 7px 12px; border-radius: 10px; border: 1.5px dashed #e4e6ea;
  background: transparent; color: #65676b; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.add-member-btn:hover { border-color: #202d59; color: #202d59; background: rgba(32,45,89,0.04); }

.add-member-panel {
  margin: 0 16px 8px; padding: 10px; border-radius: 12px;
  border: 1.5px solid #e4e6ea; background: #f8f9fb;
  display: flex; flex-direction: column; gap: 8px;
  overflow: hidden;
}
.search-wrap { position: relative; }
.search-icon {
  position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
  width: 14px; height: 14px; color: #b0b3b8;
}
.search-input {
  width: 100%; padding: 7px 10px 7px 28px; border-radius: 8px;
  border: 1.5px solid #e4e6ea; background: #fff; font-size: 0.82rem;
  outline: none; font-family: 'DM Sans', sans-serif; box-sizing: border-box; transition: border-color 0.2s;
}
.search-input:focus { border-color: #202d59; }

.add-member-list { display: flex; flex-direction: column; gap: 2px; max-height: 150px; overflow-y: auto; }
.add-member-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 6px; border-radius: 8px; border: none; background: transparent;
  cursor: pointer; transition: background 0.15s; font-family: 'DM Sans', sans-serif;
}
.add-member-row:hover:not(:disabled) { background: rgba(32,45,89,0.06); }
.add-member-row:disabled { opacity: 0.5; cursor: not-allowed; }
.sm-avatar {
  width: 28px; height: 28px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: linear-gradient(135deg, #202d59, #a31e22);
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.62rem; font-weight: 700;
}
.sm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sm-name { flex: 1; font-size: 0.8rem; color: #1c1e21; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.add-icon { color: #65676b; flex-shrink: 0; }
.add-member-loading, .add-member-empty { padding: 8px; text-align: center; color: #b0b3b8; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 6px; }

/* Members */
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
  display: flex; align-items: center; justify-content: center;
}
.rq-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rq-btn.accept { background: #dcfce7; color: #16a34a; }
.rq-btn.accept:hover:not(:disabled) { background: #16a34a; color: #fff; }
.rq-btn.reject { background: #fee2e2; color: #dc2626; }
.rq-btn.reject:hover:not(:disabled) { background: #dc2626; color: #fff; }

.ip-loading, .ip-empty { padding: 24px; text-align: center; color: #b0b3b8; font-size: 0.82rem; }
.spinner { width: 24px; height: 24px; border: 2px solid #e4e6ea; border-top-color: #202d59; border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }

/* Footer */
.ip-footer { padding: 12px 16px; border-top: 1px solid #f0f2f5; flex-shrink: 0; }
.leave-btn {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 14px;
  border-radius: 10px; border: 1.5px solid #fee2e2; background: transparent;
  color: #dc2626; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.leave-btn:hover { background: #fee2e2; }

/* Spinners */
.btn-spinner-sm {
  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.15);
  border-top-color: currentColor; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0;
}
.inline-spinner { border-top-color: #202d59; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.panel-slide-enter-active { animation: slideIn 0.25s ease; }
.panel-slide-leave-active { animation: slideIn 0.2s ease reverse; }
@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } }

.expand-enter-active { animation: expandDown 0.2s ease; }
.expand-leave-active { animation: expandDown 0.15s ease reverse; }
@keyframes expandDown { from { opacity: 0; transform: translateY(-6px); max-height: 0; } to { opacity: 1; max-height: 300px; } }

/* Confirmation Dialog */
.dialog-backdrop {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.dialog-box {
  width: 360px; max-width: 100%; background: #fff; border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2); padding: 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
  font-family: 'DM Sans', sans-serif;
}
.dialog-icon {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dialog-icon.danger { background: #fee2e2; color: #dc2626; }
.dialog-icon.info { background: rgba(32,45,89,0.1); color: #202d59; }
.dialog-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; color: #1c1e21; margin: 0; }
.dialog-msg { font-size: 0.85rem; color: #65676b; line-height: 1.5; margin: 0; }
.dialog-actions { display: flex; gap: 8px; width: 100%; margin-top: 4px; }
.dialog-cancel {
  flex: 1; padding: 9px; border-radius: 10px; border: 1.5px solid #e4e6ea;
  background: transparent; color: #65676b; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.dialog-cancel:hover { background: #f0f2f5; }
.dialog-confirm {
  flex: 1; padding: 9px; border-radius: 10px; border: none;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.dialog-confirm.danger { background: #dc2626; color: #fff; }
.dialog-confirm.danger:hover { background: #b91c1c; }
.dialog-confirm.info { background: linear-gradient(135deg, #202d59, #2a3a6e); color: #fff; }
.dialog-confirm.info:hover { box-shadow: 0 4px 12px rgba(32,45,89,0.3); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.dialog-pop-enter-active { animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
.dialog-pop-leave-active { animation: popIn 0.15s ease reverse; }
@keyframes popIn { from { opacity: 0; transform: scale(0.9); } }
</style>