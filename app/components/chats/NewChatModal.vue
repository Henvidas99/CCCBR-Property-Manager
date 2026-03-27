<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="backdrop" @click.self="close">
        <Transition name="modal-slide">
          <div v-if="modelValue" class="modal">

            <!-- Header -->
            <div class="modal-header">
              <div class="header-tabs">
                <button :class="['htab', mode === 'dm' && 'active']" @click="mode = 'dm'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Mensaje a asociado
                </button>
                <button :class="['htab', mode === 'group' && 'active']" @click="mode = 'group'">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Nuevo grupo
                </button>
              </div>
              <button class="close-btn" @click="close">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- ── DM mode ──────────────────────────────────────── -->
            <div v-if="mode === 'dm'" class="modal-body">
              <div class="search-wrap">
                <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input v-model="userSearch" ref="searchInput" placeholder="Buscar usuario por nombre…" class="search-input" />
              </div>

              <div v-if="loadingUsers" class="list-loading">
                <div v-for="i in 4" :key="i" class="sk-row">
                  <div class="sk-av"/>
                  <div class="sk-body"><div class="sk-line w60"/><div class="sk-line w40"/></div>
                </div>
              </div>

              <div v-else class="user-list">
                <div v-if="filteredUsers.length === 0 && userSearch" class="empty">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <p>No se encontró ningún usuario</p>
                </div>
                <div v-else-if="filteredUsers.length === 0" class="empty-hint">
                  <p>Escribe un nombre para buscar</p>
                </div>

                <button v-for="u in filteredUsers" :key="u.id" class="user-row" @click="startDM(u)">
                  <div class="user-av">
                    <img v-if="u.photo" :src="u.photo" :alt="u.fullName"/>
                    <span v-else>{{ initials(u.fullName) }}</span>
                  </div>
                  <div class="user-info">
                    <span class="user-name">{{ u.fullName }}</span>
                    <span class="user-email">{{ u.email }}</span>
                  </div>
                  <div class="user-action">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- ── Group mode ───────────────────────────────────── -->
            <div v-else class="modal-body">

              <!-- Avatar picker -->
              <div class="avatar-picker-section">
                <div class="group-avatar-preview" :style="avatarPreviewUrl ? {} : { background: 'linear-gradient(135deg, #202d59, #a31e22)' }">
                  <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" class="avatar-preview-img"/>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div class="avatar-picker-info">
                  <label class="avatar-pick-label">
                    <input type="file" accept="image/*" class="hidden-file" @change="onAvatarPick"/>
                    <span class="avatar-pick-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ avatarFile ? 'Cambiar imagen' : 'Agregar imagen' }}
                    </span>
                  </label>
                  <button v-if="avatarFile" class="avatar-remove-btn" @click="removeAvatar">Quitar</button>
                  <p class="avatar-hint">Opcional · PNG, JPG, GIF</p>
                </div>
              </div>

              <!-- Group name -->
              <div class="form-section">
                <label class="form-label">Nombre del grupo *</label>
                <input v-model="groupForm.name" class="form-input" placeholder="Ej: Brokers Zona Norte" maxlength="100"/>
              </div>

              <div class="form-section">
                <label class="form-label">Descripción</label>
                <textarea v-model="groupForm.description" class="form-input form-textarea" placeholder="¿De qué trata este grupo?" rows="2" maxlength="300"/>
              </div>

              <div class="form-section">
                <label class="form-label">Privacidad</label>
                <div class="privacy-toggle">
                  <button :class="['ptab', groupForm.privacy === 'public' && 'active']" @click="groupForm.privacy = 'public'">
                    🌐 Público
                    <span class="ptab-hint">Cualquiera puede unirse</span>
                  </button>
                  <button :class="['ptab', groupForm.privacy === 'private' && 'active']" @click="groupForm.privacy = 'private'">
                    🔒 Privado
                    <span class="ptab-hint">Requiere aprobación</span>
                  </button>
                </div>
              </div>

              <!-- Member search -->
              <div class="form-section">
                <label class="form-label">Agregar miembros (opcional)</label>
                <div class="search-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <input v-model="memberSearch" placeholder="Buscar usuarios…" class="search-input"/>
                </div>

                <div v-if="selectedMembers.length" class="chips">
                  <div v-for="m in selectedMembers" :key="m.id" class="chip">
                    <span>{{ m.fullName.split(' ')[0] }}</span>
                    <button @click="toggleMember(m)">✕</button>
                  </div>
                </div>

                <div class="member-pick-list">
                  <button v-for="u in filteredMemberSearch" :key="u.id"
                    :class="['mpick-row', selectedMembers.find(m => m.id === u.id) && 'selected']"
                    @click="toggleMember(u)">
                    <div class="user-av small">
                      <img v-if="u.photo" :src="u.photo" :alt="u.fullName"/>
                      <span v-else>{{ initials(u.fullName) }}</span>
                    </div>
                    <span class="mpick-name">{{ u.fullName }}</span>
                    <div class="mpick-check" v-if="selectedMembers.find(m => m.id === u.id)">✓</div>
                  </button>
                </div>
              </div>

              <!-- Create button -->
              <div class="form-footer">
                <button class="create-btn" :disabled="!groupForm.name.trim() || creating" @click="createGroup">
                  <div v-if="creating" class="btn-spinner"/>
                  <span v-else>Crear grupo</span>
                </button>
              </div>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useUser } from '~/composables/useUser'
import { useChats } from '~/composables/useChats'
import { chatService } from '~/services/chat.service'
import type { UserProfile } from '~/services/user.service'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue', 'chat-opened'])

const { users, fetchAllUsers, user: currentUser } = useUser()
const { createDirectChat, createGroup: createGroupFn, selectChat } = useChats()

const mode = ref<'dm' | 'group'>('dm')
const userSearch = ref('')
const memberSearch = ref('')
const creating = ref(false)
const loadingUsers = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const selectedMembers = ref<UserProfile[]>([])

// Avatar state
const avatarFile = ref<File | null>(null)
const avatarPreviewUrl = ref<string | null>(null)

const groupForm = ref({
  name: '',
  description: '',
  privacy: 'public' as 'public' | 'private',
})

watch(() => props.modelValue, async (val) => {
  if (val) {
    if (!users.value.length) {
      loadingUsers.value = true
      await fetchAllUsers()
      loadingUsers.value = false
    }
    nextTick(() => searchInput.value?.focus())
  }
})

const otherUsers = computed(() =>
  users.value.filter(u => u.id !== currentUser.value?.id)
)

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return []
  const q = userSearch.value.toLowerCase()
  return otherUsers.value.filter(u =>
    u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  ).slice(0, 10)
})

const filteredMemberSearch = computed(() => {
  const q = memberSearch.value.toLowerCase()
  if (!q) return otherUsers.value.slice(0, 8)
  return otherUsers.value.filter(u =>
    u.fullName.toLowerCase().includes(q)
  ).slice(0, 8)
})

function onAvatarPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  // Revoke previous preview
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarFile.value = file
  avatarPreviewUrl.value = URL.createObjectURL(file)
}

function removeAvatar() {
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarFile.value = null
  avatarPreviewUrl.value = null
}

async function startDM(u: UserProfile) {
  creating.value = true
  try {
    const chat = await createDirectChat(u.id)
    if (chat) {
      await selectChat(chat)
      emit('chat-opened', chat)
    }
  } finally {
    creating.value = false
    close()
  }
}

function toggleMember(u: UserProfile) {
  const idx = selectedMembers.value.findIndex(m => m.id === u.id)
  if (idx >= 0) {
    selectedMembers.value.splice(idx, 1)
  } else {
    selectedMembers.value.push(u)
  }
}

async function createGroup() {
  if (!groupForm.value.name.trim()) return
  creating.value = true
  try {
    // 1. Create the group
    const chat = await createGroupFn({
      name: groupForm.value.name.trim(),
      description: groupForm.value.description.trim() || undefined,
      privacy: groupForm.value.privacy,
      memberIds: selectedMembers.value.map(m => m.id),
    })

    if (chat) {
      // 2. Upload avatar if provided
      if (avatarFile.value) {
        try {
          await chatService.updateGroupAvatar(chat.id, avatarFile.value)
        } catch (e) {
          console.error('[NewChatModal] avatar upload failed', e)
          // Non-fatal: group was created, avatar just didn't upload
        }
      }

      await selectChat(chat)
      emit('chat-opened', chat)
    }
  } finally {
    creating.value = false
    close()
  }
}

function close() {
  emit('update:modelValue', false)
  setTimeout(() => {
    mode.value = 'dm'
    userSearch.value = ''
    memberSearch.value = ''
    selectedMembers.value = []
    groupForm.value = { name: '', description: '', privacy: 'public' }
    removeAvatar()
  }, 300)
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

.backdrop {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}

.modal {
  width: 480px; max-width: 100%;
  max-height: min(680px, calc(100vh - 32px));
  background: #fff; border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.2);
  display: flex; flex-direction: column; overflow: hidden;
}

/* Header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 0; flex-shrink: 0;
}
.header-tabs { display: flex; gap: 4px; }
.htab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  border: 1.5px solid transparent; background: transparent; color: #65676b;
  cursor: pointer; transition: all 0.2s;
}
.htab:hover { background: #f0f2f5; }
.htab.active {
  background: rgba(32,45,89,0.08); border-color: rgba(32,45,89,0.2); color: #202d59;
}
.close-btn {
  width: 30px; height: 30px; border-radius: 8px; border: none; background: none;
  cursor: pointer; color: #65676b; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.close-btn:hover { background: #f0f2f5; }

/* Body */
.modal-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }

/* Avatar picker */
.avatar-picker-section {
  display: flex; align-items: center; gap: 14px;
  padding: 12px; border-radius: 12px; background: #f8f9fb;
  border: 1.5px solid #e4e6ea;
}
.group-avatar-preview {
  width: 56px; height: 56px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-picker-info { display: flex; flex-direction: column; gap: 4px; }
.avatar-pick-label { cursor: pointer; }
.avatar-pick-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 8px;
  background: #fff; border: 1.5px solid #e4e6ea;
  font-size: 0.78rem; font-weight: 600; color: #202d59;
  cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.avatar-pick-btn:hover { border-color: #202d59; background: rgba(32,45,89,0.05); }
.hidden-file { display: none; }
.avatar-remove-btn {
  padding: 3px 8px; border-radius: 6px; border: none;
  background: #fee2e2; color: #dc2626; font-size: 0.72rem; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; width: fit-content;
}
.avatar-hint { font-size: 0.68rem; color: #b0b3b8; margin: 0; }

/* Search */
.search-wrap { position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #b0b3b8; }
.search-input {
  width: 100%; padding: 9px 12px 9px 34px; border-radius: 10px;
  border: 1.5px solid #e4e6ea; background: #f8f9fb;
  font-family: 'DM Sans', sans-serif; font-size: 0.85rem; outline: none; transition: all 0.2s;
  box-sizing: border-box;
}
.search-input:focus { border-color: #202d59; background: #fff; }

/* User list */
.user-list { flex: 1; overflow-y: auto; }
.user-row {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 8px 6px; border-radius: 10px; border: none; background: transparent;
  cursor: pointer; transition: background 0.15s; text-align: left;
}
.user-row:hover { background: rgba(32,45,89,0.05); }

.user-av {
  width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
  background: linear-gradient(135deg, #202d59, #a31e22);
  display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75rem; font-weight: 700;
}
.user-av.small { width: 30px; height: 30px; font-size: 0.65rem; }
.user-av img { width: 100%; height: 100%; object-fit: cover; }
.user-info { flex: 1; min-width: 0; }
.user-name { display: block; font-size: 0.875rem; font-weight: 600; color: #1c1e21; }
.user-email { font-size: 0.75rem; color: #b0b3b8; }
.user-action { color: #b0b3b8; flex-shrink: 0; }

.empty, .empty-hint { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 28px 0; color: #b0b3b8; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; }

/* Form */
.form-section { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #65676b; text-transform: uppercase; letter-spacing: 0.05em; }
.form-input {
  width: 100%; padding: 9px 12px; border-radius: 10px; border: 1.5px solid #e4e6ea;
  background: #f8f9fb; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
  outline: none; transition: all 0.2s; box-sizing: border-box; resize: none;
}
.form-input:focus { border-color: #202d59; background: #fff; }
.form-textarea { line-height: 1.5; }

/* Privacy toggle */
.privacy-toggle { display: flex; gap: 8px; }
.ptab {
  flex: 1; padding: 10px 12px; border-radius: 10px;
  border: 1.5px solid #e4e6ea; background: #f8f9fb;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  color: #65676b; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.ptab:hover { border-color: #202d59; }
.ptab.active { border-color: #202d59; background: rgba(32,45,89,0.06); color: #202d59; }
.ptab-hint { font-size: 0.65rem; font-weight: 400; color: #b0b3b8; }
.ptab.active .ptab-hint { color: #65676b; }

/* Chips */
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.chip {
  display: flex; align-items: center; gap: 4px;
  padding: 3px 10px 3px 8px; border-radius: 20px;
  background: rgba(32,45,89,0.08); color: #202d59;
  font-size: 0.78rem; font-weight: 600;
}
.chip button { background: none; border: none; cursor: pointer; color: #a31e22; font-size: 0.7rem; padding: 0; line-height: 1; }

/* Member pick list */
.member-pick-list { max-height: 160px; overflow-y: auto; margin-top: 6px; }
.mpick-row {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 6px 6px; border-radius: 8px; border: none; background: transparent;
  cursor: pointer; transition: background 0.15s; text-align: left;
}
.mpick-row:hover { background: rgba(32,45,89,0.04); }
.mpick-row.selected { background: rgba(32,45,89,0.08); }
.mpick-name { flex: 1; font-size: 0.82rem; font-weight: 500; color: #1c1e21; }
.mpick-check { color: #16a34a; font-weight: 700; font-size: 0.85rem; }

/* Footer */
.form-footer { padding-top: 4px; }
.create-btn {
  width: 100%; padding: 11px; border-radius: 12px;
  background: linear-gradient(135deg, #202d59, #a31e22); color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
  border: none; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.create-btn:hover:not(:disabled) { box-shadow: 0 4px 16px rgba(163,30,34,0.3); transform: translateY(-1px); }
.create-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Skeletons */
.list-loading { display: flex; flex-direction: column; gap: 4px; }
.sk-row { display: flex; align-items: center; gap: 10px; padding: 8px 6px; }
.sk-av { width: 38px; height: 38px; border-radius: 50%; background: #f0f2f5; animation: pulse 1.5s ease-in-out infinite; flex-shrink: 0; }
.sk-body { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.sk-line { height: 9px; border-radius: 5px; background: #f0f2f5; animation: pulse 1.5s ease-in-out infinite; }
.sk-line.w60 { width: 60%; }
.sk-line.w40 { width: 40%; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Spinner */
.btn-spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-slide-enter-active { animation: slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.modal-slide-leave-active { animation: slideIn 0.18s ease reverse; }
@keyframes slideIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } }
</style>