<!-- components/brokers/BrokerCard.vue -->
<template>
  <div
    class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 cursor-pointer hover:-translate-y-1"
    :style="{ borderLeftColor: borderColor }"
    @click="goToDetail"
  >
    <div class="h-1 w-full" :style="{ background: colorsPalette.button }" />

    <div class="p-5 flex flex-col items-center text-center gap-3">
      <!-- Avatar -->
      <div class="relative">
        <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
          <img v-if="broker.photo" :src="broker.photo" :alt="broker.fullName" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
            :style="{ background: colorsPalette.button }">
            {{ initials }}
          </div>
        </div>
      </div>

      <!-- Role code badge -->
      <div class="px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase text-white"
        :style="{ background: colorsPalette.primaryB }">
        {{ broker.roleCodeName }}
      </div>

      <!-- Name -->
      <div>
        <h3 class="font-bold text-gray-800 text-base leading-tight group-hover:transition"
          :style="{ color: 'inherit' }" @mouseover="e => (e.target as HTMLElement).style.color = colorsPalette.primaryB"
          @mouseleave="e => (e.target as HTMLElement).style.color = 'inherit'">
          {{ broker.fullName }}
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">{{ broker.position || 'Corredor' }}</p>
      </div>

      <!-- Stats -->
      <div class="w-full flex justify-around border-t border-gray-100 pt-3 mt-1">
        <div class="flex flex-col items-center">
          <span class="text-xs text-gray-400">Género</span>
          <span class="text-sm font-semibold text-gray-700">{{ genderLabel }}</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-xs text-gray-400">Miembro desde</span>
          <span class="text-sm font-semibold text-gray-700">{{ memberSince }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="w-full flex gap-2 mt-1">
        <!-- Botón dinámico según allyStatus -->
        <button
          v-if="allyStatus.status === 'none'"
          @click.stop="$emit('send-alliance', broker)"
          class="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
          :style="{ background: colorsPalette.button }"
        >
          Enviar Alianza
        </button>
        <button
          v-else-if="allyStatus.status === 'request_sent'"
          @click.stop="$emit('cancel-request', allyStatus.requestId!)"
          class="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200"
          :style="{ borderColor: colorsPalette.primaryB, color: colorsPalette.primaryB }"
        >
          Solicitud enviada ✓
        </button>
        <button
          v-else-if="allyStatus.status === 'request_received'"
          @click.stop="$emit('send-alliance', broker)"
          class="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
          :style="{ background: colorsPalette.secondaryA + 'cc' }"
        >
          Responder solicitud
        </button>
        <div
          v-else-if="allyStatus.status === 'ally'"
          class="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
          :style="{ background: '#f0fdf4', color: colorsPalette.success }"
        >
          ✓ Aliados
        </div>

        <button
          @click.stop="goToDetail"
          class="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-xs font-semibold"
        >
          Ver perfil
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
const genderLabel = computed(() => {
  const g = props.broker.gender?.toLowerCase()
  if (g === 'm' || g === 'male' || g === 'masculino') return 'Hombre'
  if (g === 'f' || g === 'female' || g === 'femenino') return 'Mujer'
  return props.broker.gender || '—'
})
const memberSince = computed(() => new Date(props.broker.createdDate).getFullYear().toString())

function goToDetail() {
  router.push(`/asociados/${props.broker.roleCodeName}?id=${props.broker.id}`)
}
</script>