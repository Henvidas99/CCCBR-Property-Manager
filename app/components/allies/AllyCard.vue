<!-- components/allies/AllyCard.vue -->
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all">
    <!-- Avatar -->
    <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
      <img v-if="ally.photo" :src="ally.photo" :alt="ally.fullName" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-white font-bold text-lg"
        :style="{ background: colorsPalette.button }">
        {{ initials }}
      </div>
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-gray-800 truncate text-sm">{{ ally.fullName }}</p>
      <p class="text-xs text-gray-400 truncate">{{ ally.position || ally.email }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 flex-shrink-0">
      <button
        @click="$emit('view-profile', ally.id)"
        class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition"
        title="Ver perfil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
      <button
        @click="$emit('remove', ally.id)"
        class="p-2 rounded-lg border transition"
        :style="{ borderColor: colorsPalette.error + '44', color: colorsPalette.error }"
        title="Eliminar aliado"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserSummary } from '~/services/ally.service'
import { colorsPalette } from '~/helpers/colorsPalette'

const props = defineProps<{ ally: UserSummary }>()
defineEmits<{
  (e: 'remove', id: number): void
  (e: 'view-profile', id: number): void
}>()

const initials = computed(() =>
  props.ally.fullName.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase(),
)
</script>