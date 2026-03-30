<!-- pages/asociados/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero -->
    <div class="relative overflow-hidden py-14 px-6" :style="{ background: colorsPalette.primaryB }">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full" :style="{ background: colorsPalette.primaryA }" />
        <div class="absolute -bottom-16 -left-16 w-72 h-72 rounded-full" :style="{ background: colorsPalette.secondaryA }" />
      </div>
      <div class="relative max-w-6xl mx-auto">
        <p class="text-sm font-semibold tracking-widest uppercase mb-2" :style="{ color: colorsPalette.secondaryA }">
          Red de Profesionales
        </p>
        <h1 class="text-white font-bold text-4xl md:text-5xl leading-tight mb-3" style="font-family: Georgia, serif;">
          Nuestros Asociados
        </h1>
        <p class="text-blue-200 text-lg max-w-xl">
          Conecta con los mejores corredores de bienes raíces. Expertos listos para acompañarte.
        </p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="relative w-full sm:w-80">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="Buscar por nombre o código..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 transition"
          :style="{ '--tw-ring-color': colorsPalette.primaryB }"
        />
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500">{{ total }} asociados</span>
        <div class="flex rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
          <button @click="viewMode = 'grid'"
            :class="['px-3 py-2 transition', viewMode === 'grid' ? 'text-white' : 'text-gray-500 hover:bg-gray-50']"
            :style="viewMode === 'grid' ? { background: colorsPalette.primaryB } : {}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button @click="viewMode = 'list'"
            :class="['px-3 py-2 transition', viewMode === 'list' ? 'text-white' : 'text-gray-500 hover:bg-gray-50']"
            :style="viewMode === 'list' ? { background: colorsPalette.primaryB } : {}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="max-w-6xl mx-auto px-4 py-16 flex justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          :style="{ borderColor: `${colorsPalette.primaryB} transparent transparent transparent` }" />
        <p class="text-gray-500 text-sm">Cargando asociados...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-6xl mx-auto px-4 py-12 text-center">
      <p :style="{ color: colorsPalette.error }">{{ error }}</p>
      <button @click="fetchBrokers" class="mt-4 px-5 py-2 rounded-lg text-white text-sm transition"
        :style="{ background: colorsPalette.primaryB }">
        Reintentar
      </button>
    </div>

    <!-- Grid -->
    <div v-else-if="viewMode === 'grid'" class="max-w-6xl mx-auto px-4 pb-10">
      <div v-if="brokers.length === 0" class="py-20 text-center text-gray-400">
        No se encontraron asociados.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <BrokerCard
          v-for="broker in brokers"
          :key="broker.id"
          :broker="broker"
          :ally-status="getAllyStatus(broker.id)"
          @send-alliance="openAllianceModal"
          @cancel-request="handleCancelRequest"
        />
      </div>
    </div>

    <!-- List -->
    <div v-else class="max-w-6xl mx-auto px-4 pb-10">
      <div v-if="brokers.length === 0" class="py-20 text-center text-gray-400">
        No se encontraron asociados.
      </div>
      <div v-else class="flex flex-col gap-3">
        <BrokerListItem
          v-for="broker in brokers"
          :key="broker.id"
          :broker="broker"
          :ally-status="getAllyStatus(broker.id)"
          @send-alliance="openAllianceModal"
          @cancel-request="handleCancelRequest"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalPages > 1" class="max-w-6xl mx-auto px-4 pb-12 flex items-center justify-center gap-2">
      <button @click="prevPage" :disabled="!hasPrevPage"
        class="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm">
        ← Anterior
      </button>
      <div class="flex gap-1">
        <button v-for="p in pagesRange" :key="p" @click="goToPage(p)"
          :class="['w-9 h-9 rounded-lg text-sm font-medium transition', p === page ? 'text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50']"
          :style="p === page ? { background: colorsPalette.primaryB } : {}">
          {{ p }}
        </button>
      </div>
      <button @click="nextPage" :disabled="!hasNextPage"
        class="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm">
        Siguiente →
      </button>
    </div>

    <!-- Alliance Modal -->
    <AllianceModal
      v-if="allianceTarget"
      :broker="allianceTarget"
      @close="allianceTarget = null"
      @sent="onAllianceSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AllianceModal from '~/components/brokers/AllianceModal.vue'
import BrokerCard from '~/components/brokers/BrokerCard.vue'
import BrokerListItem from '~/components/brokers/BrokerListItem.vue'
import { useBrokers } from '~/composables/useBrokers'
import { useAllyService } from '~/services/ally.service'
import { colorsPalette } from '~/helpers/colorsPalette'
import type { BrokerDto } from '~/services/user.service'

const {
  brokers, total, totalPages, page, isLoading, error,
  hasPrevPage, hasNextPage, fetchBrokers, prevPage, nextPage,
  goToPage, applySearch, getAllyStatus, refreshStatusFor,
} = useBrokers()

const allyService = useAllyService()
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')
const allianceTarget = ref<BrokerDto | null>(null)

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => applySearch(searchQuery.value), 400)
}

function openAllianceModal(broker: BrokerDto) {
  allianceTarget.value = broker
}

async function onAllianceSent(brokerId: number) {
  allianceTarget.value = null
  await refreshStatusFor(brokerId)
}

async function handleCancelRequest(requestId: number) {
  await allyService.cancelRequest(requestId)
  // Recargamos el status del broker afectado
  const broker = brokers.value.find(
    (b) => getAllyStatus(b.id).requestId === requestId,
  )
  if (broker) await refreshStatusFor(broker.id)
}

const pagesRange = computed(() => {
  const range: number[] = []
  const delta = 2
  const start = Math.max(1, page.value - delta)
  const end = Math.min(totalPages.value, page.value + delta)
  for (let i = start; i <= end; i++) range.push(i)
  return range
})

onMounted(() => fetchBrokers())
</script>