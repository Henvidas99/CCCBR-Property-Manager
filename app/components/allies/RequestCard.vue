<!-- components/allies/RequestCard.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all">
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <div class="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
        <img v-if="request.requester?.photo" :src="request.requester.photo" :alt="request.requester.fullName" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-white font-bold"
          :style="{ background: colorsPalette.button }">
          {{ initials }}
        </div>
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-gray-800 text-sm truncate">{{ request.requester?.fullName }}</p>
        <p v-if="request.message" class="text-xs text-gray-400 truncate italic">"{{ request.message }}"</p>
        <p class="text-xs text-gray-300 mt-0.5">{{ timeAgo }}</p>
      </div>
    </div>

    <div class="flex gap-2 flex-shrink-0">
      <button
        @click="$emit('accept', request.id)"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-60"
        :style="{ background: colorsPalette.success }"
      >
        Aceptar
      </button>
      <button
        @click="$emit('reject', request.id)"
        :disabled="isLoading"
        class="px-4 py-2 rounded-xl text-xs font-semibold border transition disabled:opacity-60"
        :style="{ borderColor: colorsPalette.error + '66', color: colorsPalette.error }"
      >
        Rechazar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AllyRequest } from '~/services/ally.service'
import { colorsPalette } from '~/helpers/colorsPalette'

const props = defineProps<{ request: AllyRequest; isLoading?: boolean }>()
defineEmits<{
  (e: 'accept', id: number): void
  (e: 'reject', id: number): void
}>()

const initials = computed(() =>
  props.request.requester?.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?',
)

const timeAgo = computed(() => {
  const diff = Date.now() - new Date(props.request.createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
})
</script>