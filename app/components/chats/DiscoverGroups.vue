<template>
  <div class="discover">
    <!-- Search -->
    <div class="d-search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" class="d-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input v-model="search" placeholder="Buscar grupos…" class="d-input" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-loading">
      <div v-for="i in 4" :key="i" class="skeleton-item">
        <div class="sk-avatar" />
        <div class="sk-text">
          <div class="sk-line wide" />
          <div class="sk-line narrow" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="d-empty">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <p>No hay grupos disponibles</p>
    </div>

    <!-- List -->
    <div v-else class="d-list">
      <div v-for="group in filtered" :key="group.id" class="d-card">
        <!-- Avatar -->
        <div class="d-avatar" :style="{ background: groupColor(group.name ?? '') }">
          <img v-if="group.avatarUrl" :src="group.avatarUrl" class="d-avatar-img" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>

        <!-- Info -->
        <div class="d-info">
          <div class="d-top">
            <span class="d-name">{{ group.name }}</span>
            <span class="d-privacy" :class="group.privacy">
              {{ group.privacy === 'public' ? '🌐 Público' : '🔒 Privado' }}
            </span>
          </div>
          <p v-if="group.description" class="d-desc">{{ group.description }}</p>
          <p class="d-members">{{ group.members?.filter(m => !m.hasLeft).length ?? 0 }} miembros</p>
        </div>

        <!-- Action -->
        <button
          class="d-join-btn"
          :class="{ loading: joiningId === group.id, requested: requestedIds.has(group.id) }"
          :disabled="joiningId === group.id || requestedIds.has(group.id)"
          @click="handleJoin(group)"
        >
          <span v-if="requestedIds.has(group.id)">Solicitado ✓</span>
          <span v-else-if="joiningId === group.id">
            <div class="btn-spinner" />
          </span>
          <span v-else>
            {{ group.privacy === 'public' ? 'Unirse' : 'Solicitar' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Confirm modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="confirmGroup" class="confirm-backdrop" @click.self="confirmGroup = null">
          <div class="confirm-box">
            <div class="confirm-icon" :class="confirmGroup.privacy">
              <span>{{ confirmGroup.privacy === 'public' ? '🌐' : '🔒' }}</span>
            </div>
            <h3 class="confirm-title">
              {{ confirmGroup.privacy === 'public' ? '¿Unirse al grupo?' : '¿Solicitar unión?' }}
            </h3>
            <p class="confirm-body">
              <strong>{{ confirmGroup.name }}</strong>
              <template v-if="confirmGroup.privacy === 'public'">
                — Serás miembro inmediatamente.
              </template>
              <template v-else>
                — Tu solicitud será revisada por un administrador.
              </template>
            </p>
            <div class="confirm-actions">
              <button class="c-btn cancel" @click="confirmGroup = null">Cancelar</button>
              <button class="c-btn confirm" @click="confirmJoin">
                {{ confirmGroup.privacy === 'public' ? 'Unirse' : 'Solicitar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Chat } from '~/composables/useChats'
import { useChats } from '~/composables/useChats'

const props = defineProps<{ availableGroups: Chat[]; loading?: boolean }>()
const emit = defineEmits(['joined', 'requested'])

const { joinPublicGroup, requestJoin } = useChats()

const search = ref('')
const joiningId = ref<string | null>(null)
const requestedIds = ref<Set<string>>(new Set())
const confirmGroup = ref<Chat | null>(null)

const filtered = computed(() =>
  search.value
    ? props.availableGroups.filter(g =>
        (g.name ?? '').toLowerCase().includes(search.value.toLowerCase())
      )
    : props.availableGroups
)

function groupColor(name: string) {
  const colors = ['#202d59', '#a31e22', '#1e5f74', '#2d6a4f', '#6a2d8f', '#8f4e2d']
  const idx = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length
  return colors[idx]
}

function handleJoin(group: Chat) {
  confirmGroup.value = group
}

async function confirmJoin() {
  if (!confirmGroup.value) return
  const group = confirmGroup.value
  confirmGroup.value = null
  joiningId.value = group.id

  try {
    if (group.privacy === 'public') {
      const ok = await joinPublicGroup(group.id)
      if (ok) emit('joined', group)
    } else {
      const ok = await requestJoin(group.id)
      if (ok) {
        requestedIds.value = new Set([...requestedIds.value, group.id])
        emit('requested', group)
      }
    }
  } finally {
    joiningId.value = null
  }
}
</script>

<style scoped>
.discover { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

.d-search-wrap { position: relative; margin: 8px 8px 6px; flex-shrink: 0; }
.d-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 15px; height: 15px; color: #b0b3b8; }
.d-input {
  width: 100%; padding: 7px 12px 7px 32px; border-radius: 10px;
  border: 1.5px solid #e4e6ea; background: #f8f9fb;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; outline: none;
  transition: border-color 0.2s;
}
.d-input:focus { border-color: #202d59; background: #fff; }

.d-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.08) transparent; }

.d-card {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 8px; border-radius: 12px; transition: background 0.15s; margin-bottom: 2px;
}
.d-card:hover { background: rgba(32,45,89,0.04); }

.d-avatar {
  width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.d-avatar-img { width: 100%; height: 100%; object-fit: cover; }

.d-info { flex: 1; min-width: 0; }
.d-top { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; flex-wrap: wrap; }
.d-name { font-size: 0.85rem; font-weight: 600; color: #1c1e21; }
.d-privacy { font-size: 0.68rem; font-weight: 600; padding: 1px 6px; border-radius: 20px; }
.d-privacy.public { background: #dcfce7; color: #16a34a; }
.d-privacy.private { background: #fef3c7; color: #d97706; }
.d-desc { font-size: 0.75rem; color: #65676b; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.d-members { font-size: 0.72rem; color: #b0b3b8; margin: 0; }

.d-join-btn {
  flex-shrink: 0; padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 600;
  background: linear-gradient(135deg, #202d59, #a31e22); color: #fff;
  border: none; cursor: pointer; transition: all 0.2s; min-width: 72px;
  display: flex; align-items: center; justify-content: center;
}
.d-join-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 4px 12px rgba(163,30,34,0.3); }
.d-join-btn.requested { background: #e4e6ea; color: #65676b; cursor: default; }
.d-join-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Skeletons */
.d-loading { padding: 8px; }
.skeleton-item { display: flex; align-items: center; gap: 10px; padding: 10px 8px; }
.sk-avatar { width: 42px; height: 42px; border-radius: 12px; background: #f0f2f5; animation: pulse 1.5s ease-in-out infinite; flex-shrink: 0; }
.sk-text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.sk-line { height: 10px; border-radius: 6px; background: #f0f2f5; animation: pulse 1.5s ease-in-out infinite; }
.sk-line.wide { width: 60%; }
.sk-line.narrow { width: 35%; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.d-empty, .d-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px 0; color: #b0b3b8; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; }

/* Confirm modal */
.confirm-backdrop { position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.confirm-box { background: #fff; border-radius: 20px; padding: 28px; max-width: 360px; width: 100%; box-shadow: 0 24px 80px rgba(0,0,0,0.2); text-align: center; }
.confirm-icon { width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.confirm-icon.public { background: #dcfce7; }
.confirm-icon.private { background: #fef3c7; }
.confirm-title { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #1c1e21; margin: 0 0 8px; }
.confirm-body { font-size: 0.85rem; color: #65676b; line-height: 1.5; margin: 0 0 20px; }
.confirm-actions { display: flex; gap: 10px; }
.c-btn { flex: 1; padding: 10px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
.c-btn.cancel { background: #f0f2f5; color: #65676b; }
.c-btn.cancel:hover { background: #e4e6ea; }
.c-btn.confirm { background: linear-gradient(135deg, #202d59, #a31e22); color: #fff; }
.c-btn.confirm:hover { box-shadow: 0 4px 12px rgba(163,30,34,0.3); }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>