<!-- pages/aliados.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero -->
    <div class="relative overflow-hidden py-12 px-6" :style="{ background: colorsPalette.primaryB }">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full" :style="{ background: colorsPalette.primaryA }" />
        <div class="absolute -bottom-12 -left-12 w-60 h-60 rounded-full" :style="{ background: colorsPalette.secondaryA }" />
      </div>
      <div class="relative max-w-5xl mx-auto">
        <p class="text-sm font-semibold tracking-widest uppercase mb-2" :style="{ color: colorsPalette.secondaryA }">
          Mi Red
        </p>
        <h1 class="text-white font-bold text-4xl leading-tight mb-2" style="font-family: Georgia, serif;">
          Mis Aliados
        </h1>
        <p class="text-blue-200">
          Gestiona tu red de aliados y solicitudes de alianza.
        </p>

        <!-- Stats row -->
        <div class="mt-6 flex flex-wrap gap-4">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
            <span class="text-2xl font-bold text-white">{{ alliesTotal }}</span>
            <span class="text-blue-200 text-sm">Aliados</span>
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
            <span class="text-2xl font-bold text-white">{{ pendingReceivedCount }}</span>
            <span class="text-blue-200 text-sm">Solicitudes recibidas</span>
            <span v-if="pendingReceivedCount > 0"
              class="w-2 h-2 rounded-full animate-ping"
              :style="{ background: colorsPalette.secondaryA }" />
          </div>
          <div class="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
            <span class="text-2xl font-bold text-white">{{ pendingSentCount }}</span>
            <span class="text-blue-200 text-sm">Enviadas pendientes</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-5xl mx-auto px-4 pt-6">
      <div class="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-100 p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key as 'allies' | 'received' | 'sent' | 'suggestions'"
          :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2',
            activeTab === tab.key ? 'text-white shadow' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50']"
          :style="activeTab === tab.key ? { background: colorsPalette.primaryB } : {}"
        >
          {{ tab.label }}
          <span v-if="tab.badge" class="text-xs px-1.5 py-0.5 rounded-full font-bold"
            :style="activeTab === tab.key
              ? { background: 'rgba(255,255,255,0.25)', color: 'white' }
              : { background: colorsPalette.primaryA, color: 'white' }">
            {{ tab.badge }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Tab: Aliados ───────────────────────────────────────────────────── -->
    <div v-if="activeTab === 'allies'" class="max-w-5xl mx-auto px-4 py-6">
      <!-- Search -->
      <div class="relative w-full sm:w-72 mb-5">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          v-model="alliesSearchQuery"
          @input="onAlliesSearch"
          type="text"
          placeholder="Buscar aliado..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 transition"
        />
      </div>

      <div v-if="alliesLoading" class="py-12 flex justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          :style="{ borderColor: `${colorsPalette.primaryB} transparent transparent transparent` }" />
      </div>
      <div v-else-if="allies.length === 0" class="py-16 text-center">
        <p class="text-gray-400 text-lg mb-2">No tienes aliados aún</p>
        <p class="text-gray-300 text-sm">Visita la sección de Asociados para enviar solicitudes</p>
        <NuxtLink to="/asociados"
          class="mt-4 inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition"
          :style="{ background: colorsPalette.button }">
          Ver Asociados
        </NuxtLink>
      </div>
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AllyCard
            v-for="ally in allies"
            :key="ally.id"
            :ally="ally"
            @remove="handleRemoveAlly"
            @view-profile="goToProfile"
          />
        </div>

        <!-- Pagination -->
        <div v-if="alliesTotalPages > 1" class="mt-6 flex justify-center gap-2">
          <button @click="setAlliesPage(alliesPage - 1)" :disabled="!hasAlliesHasPrevPage"
            class="px-4 py-2 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm">
            ← Anterior
          </button>
          <span class="px-4 py-2 text-sm text-gray-500">
            {{ alliesPage }} / {{ alliesTotalPages }}
          </span>
          <button @click="setAlliesPage(alliesPage + 1)" :disabled="!alliesHasNextPage"
            class="px-4 py-2 rounded-lg border bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition shadow-sm">
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- ── Tab: Solicitudes recibidas ─────────────────────────────────────── -->
    <div v-else-if="activeTab === 'received'" class="max-w-5xl mx-auto px-4 py-6">
      <div v-if="receivedLoading" class="py-12 flex justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          :style="{ borderColor: `${colorsPalette.primaryB} transparent transparent transparent` }" />
      </div>
      <div v-else-if="pendingReceived.length === 0"
        class="py-16 text-center text-gray-400">
        No tienes solicitudes pendientes por responder.
      </div>
      <div v-else class="flex flex-col gap-3">
        <RequestCard
          v-for="req in pendingReceived"
          :key="req.id"
          :request="req"
          :is-loading="respondingId === req.id"
          @accept="handleAccept"
          @reject="handleReject"
        />
      </div>
    </div>

    <!-- ── Tab: Solicitudes enviadas ──────────────────────────────────────── -->
    <div v-else-if="activeTab === 'sent'" class="max-w-5xl mx-auto px-4 py-6">
      <div v-if="sentLoading" class="py-12 flex justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          :style="{ borderColor: `${colorsPalette.primaryB} transparent transparent transparent` }" />
      </div>
      <div v-else-if="pendingSent.length === 0"
        class="py-16 text-center text-gray-400">
        No tienes solicitudes enviadas pendientes.
      </div>
      <div v-else class="flex flex-col gap-3">
        <SentRequestCard
          v-for="req in pendingSent"
          :key="req.id"
          :request="req"
          :is-loading="cancellingId === req.id"
          @cancel="handleCancel"
        />
      </div>
    </div>

    <!-- ── Tab: Sugerencias ───────────────────────────────────────────────── -->
    <div v-else-if="activeTab === 'suggestions'" class="max-w-5xl mx-auto px-4 py-6">
      <div v-if="suggestionsLoading" class="py-12 flex justify-center">
        <div class="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          :style="{ borderColor: `${colorsPalette.primaryB} transparent transparent transparent` }" />
      </div>
      <div v-else-if="suggestions.length === 0"
        class="py-16 text-center text-gray-400">
        No hay sugerencias disponibles por ahora. Consigue más aliados primero.
      </div>
      <div v-else>
        <p class="text-sm text-gray-400 mb-4">
          Personas que conocen tus aliados · {{ suggestionsTotal }} sugerencias
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="s in suggestions" :key="s.id"
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div class="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
              <img v-if="s.photo" :src="s.photo" :alt="s.fullName" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-white font-bold"
                :style="{ background: colorsPalette.button }">
                {{ s.fullName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() }}
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800 text-sm truncate">{{ s.fullName }}</p>
              <p class="text-xs text-gray-400">{{ s.position || s.email }}</p>
              <p class="text-xs mt-0.5 font-medium" :style="{ color: colorsPalette.secondaryA }">
                {{ s.mutualCount }} aliado{{ s.mutualCount !== 1 ? 's' : '' }} en común
              </p>
            </div>
            <button
              @click="openAllianceFromSuggestion(s)"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex-shrink-0 transition"
              :style="{ background: colorsPalette.button }"
            >
              Solicitar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toast"
        class="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2"
        :style="{ background: toast.type === 'success' ? colorsPalette.success : colorsPalette.error }">
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Alliance modal (desde sugerencias) -->
    <AllianceModal
      v-if="allianceTarget"
      :broker="allianceTarget as any"
      @close="allianceTarget = null"
      @sent="onSuggestionSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAllies } from '~/composables/useAllies'
import { colorsPalette } from '~/helpers/colorsPalette'
import AllyCard from '~/components/allies/AllyCard.vue'
import RequestCard from '~/components/allies/RequestCard.vue'
import SentRequestCard from '~/components/allies/SentRequestCard.vue'
import AllianceModal from '~/components/brokers/AllianceModal.vue'
import type { AllySuggestion } from '~/services/ally.service'

const router = useRouter()

const {
  allies, alliesTotal, alliesPage, alliesTotalPages,
  alliesLoading, alliesError, fetchAllies, setAlliesPage,
  applyAlliesSearch, hasAlliesHasPrevPage, alliesHasNextPage,
  pendingReceived, receivedLoading, pendingReceivedCount, fetchPendingReceived,
  pendingSent, sentLoading, pendingSentCount, fetchPendingSent,
  suggestions, suggestionsTotal, suggestionsLoading, fetchSuggestions,
  respondRequest, cancelRequest, removeAlly,
} = useAllies()

const activeTab = ref<'allies' | 'received' | 'sent' | 'suggestions'>('allies')

const tabs = computed(() => [
  { key: 'allies', label: 'Mis Aliados', badge: alliesTotal.value || undefined },
  { key: 'received', label: 'Recibidas', badge: pendingReceivedCount.value || undefined },
  { key: 'sent', label: 'Enviadas', badge: pendingSentCount.value || undefined },
  { key: 'suggestions', label: 'Sugerencias', badge: undefined },
])

// Cargamos el tab activo al cambiar
watch(activeTab, (tab) => {
  if (tab === 'allies') fetchAllies()
  else if (tab === 'received') fetchPendingReceived()
  else if (tab === 'sent') fetchPendingSent()
  else if (tab === 'suggestions') fetchSuggestions()
}, { immediate: false })

// ── Búsqueda de aliados ───────────────────────────────────────────────────────
const alliesSearchQuery = ref('')
let searchTimer: ReturnType<typeof setTimeout>
function onAlliesSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applyAlliesSearch(alliesSearchQuery.value), 400)
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  setTimeout(() => (toast.value = null), 3000)
}

// ── Acciones ──────────────────────────────────────────────────────────────────
const respondingId = ref<number | null>(null)
const cancellingId = ref<number | null>(null)

async function handleAccept(requestId: number) {
  respondingId.value = requestId
  try {
    await respondRequest(requestId, 'accepted')
    showToast('success', '¡Solicitud aceptada! Ahora son aliados.')
  } catch {
    showToast('error', 'Error al aceptar la solicitud.')
  } finally {
    respondingId.value = null
  }
}

async function handleReject(requestId: number) {
  respondingId.value = requestId
  try {
    await respondRequest(requestId, 'rejected')
    showToast('success', 'Solicitud rechazada.')
  } catch {
    showToast('error', 'Error al rechazar la solicitud.')
  } finally {
    respondingId.value = null
  }
}

async function handleCancel(requestId: number) {
  cancellingId.value = requestId
  try {
    await cancelRequest(requestId)
    showToast('success', 'Solicitud cancelada.')
  } catch {
    showToast('error', 'Error al cancelar la solicitud.')
  } finally {
    cancellingId.value = null
  }
}

async function handleRemoveAlly(allyId: number) {
  try {
    await removeAlly(allyId)
    showToast('success', 'Aliado eliminado.')
  } catch {
    showToast('error', 'Error al eliminar el aliado.')
  }
}

function goToProfile(userId: number) {
  router.push(`/asociados?id=${userId}`)
}

// ── Sugerencias → modal ───────────────────────────────────────────────────────
const allianceTarget = ref<AllySuggestion | null>(null)
function openAllianceFromSuggestion(s: AllySuggestion) {
  allianceTarget.value = s
}
function onSuggestionSent() {
  allianceTarget.value = null
  showToast('success', '¡Solicitud enviada!')
  fetchSuggestions()
}

onMounted(() => {
  fetchAllies()
  fetchPendingReceived() // Para mostrar el badge aunque no estemos en ese tab
  fetchPendingSent()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>