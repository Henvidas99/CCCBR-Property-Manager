<!-- components/brokers/BrokerListItem.vue -->
<template>
  <div
    class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 overflow-hidden cursor-pointer"
    :style="{ borderLeftColor: borderColor }"
    @click="goToDetail"
  >
    <div class="flex items-center gap-4 px-5 py-4">
      <!-- Avatar -->
      <div class="w-14 h-14 rounded-full overflow-hidden ring-2 ring-offset-1 flex-shrink-0 shadow">
        <img v-if="broker.photo" :src="broker.photo" :alt="broker.fullName" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-white text-xl font-bold"
          :style="{ background: colorsPalette.button }">
          {{ initials }}
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-bold text-gray-800 text-base group-hover:transition truncate">
            {{ broker.fullName }}
          </h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold tracking-wider text-white"
            :style="{ background: colorsPalette.primaryB }">
            {{ broker.roleCodeName }}
          </span>
          <!-- Ally badge -->
          <span v-if="allyStatus.status === 'ally'"
            class="px-2 py-0.5 rounded-full text-xs font-semibold"
            :style="{ background: '#f0fdf4', color: colorsPalette.success }">
            ✓ Aliado
          </span>
        </div>
        <p class="text-sm text-gray-400 mt-0.5">{{ broker.position || 'Corredor de Bienes Raíces' }}</p>
      </div>

      <!-- Extra info (md+) -->
      <div class="hidden md:flex items-center gap-6 text-sm text-gray-500">
        <span class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {{ broker.phoneNumber || 'N/D' }}
        </span>
        <span class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Desde {{ memberSince }}
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 flex-shrink-0">
        <button
          v-if="allyStatus.status === 'none'"
          @click.stop="$emit('send-alliance', broker)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
          :style="{ background: colorsPalette.button }"
        >
          Alianza
        </button>
        <button
          v-else-if="allyStatus.status === 'request_sent'"
          @click.stop="$emit('cancel-request', allyStatus.requestId!)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
          :style="{ borderColor: colorsPalette.primaryB, color: colorsPalette.primaryB }"
        >
          Enviada ✓
        </button>
        <span
          v-else-if="allyStatus.status === 'request_received'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold"
          :style="{ background: colorsPalette.secondaryA + '22', color: colorsPalette.secondaryADark }"
        >
          Pendiente
        </span>

        <button
          @click.stop="goToDetail"
          class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { BrokerDto } from '~/services/user.service'
import type { AllyStatusResult } from '~/services/ally.service'
import { colorsPalette } from '~/helpers/colorsPalette'

const props = defineProps<{
  broker: BrokerDto
  allyStatus: AllyStatusResult
}>()

defineEmits<{
  (e: 'send-alliance', broker: BrokerDto): void
  (e: 'cancel-request', requestId: number): void
}>()

const router = useRouter()

const borderColors = [
  colorsPalette.primaryA,
  colorsPalette.primaryB,
  colorsPalette.secondaryA,
  colorsPalette.secondaryB,
]
const borderColor = computed(() => borderColors[props.broker.id % borderColors.length])
const initials = computed(() =>
  props.broker.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase(),
)
const memberSince = computed(() => new Date(props.broker.createdDate).getFullYear().toString())

function goToDetail() {
  router.push(`/asociados/${props.broker.roleCodeName}?id=${props.broker.id}`)
}
</script>