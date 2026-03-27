<template>
  <div
    class="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 overflow-hidden cursor-pointer"
    :style="{ borderLeftColor: borderColor }"
    @click="goToDetail"
  >
    <div class="flex items-center gap-4 px-5 py-4">
      <!-- Avatar -->
      <div class="w-14 h-14 rounded-full overflow-hidden ring-2 ring-offset-1 flex-shrink-0 shadow"
        :style="{ '--ring-color': borderColor }" as="div">
        <img
          v-if="broker.photo"
          :src="broker.photo"
          :alt="broker.fullName"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-white text-xl font-bold"
          :style="{ background: 'linear-gradient(135deg, #202d59 0%, #a31e22 100%)' }"
        >
          {{ initials }}
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-bold text-gray-800 text-base group-hover:text-[#202d59] transition truncate">
            {{ broker.fullName }}
          </h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold tracking-wider text-white"
            :style="{ background: '#202d59' }">
            {{ broker.roleCodeName }}
          </span>
        </div>
        <p class="text-sm text-gray-400 mt-0.5">{{ broker.position || 'Corredor de Bienes Raíces' }}</p>
      </div>

      <!-- Extra info (hidden on mobile) -->
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
          @click.stop="$emit('send-alliance', broker)"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
          :style="{ background: 'linear-gradient(45deg, #a31e22 0%, #202d59 100%)' }"
        >
          Alianza
        </button>
        <button
          @click.stop="goToDetail"
          class="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-[#202d59] transition"
          title="Ver perfil"
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

const props = defineProps<{ broker: BrokerDto }>()
defineEmits<{ (e: 'send-alliance', broker: BrokerDto): void }>()

const router = useRouter()

const borderColors = ['#a31e22', '#202d59', '#00cfe5', '#c3b3a2']
const borderColor = computed(() => borderColors[props.broker.id % borderColors.length])

const initials = computed(() =>
  props.broker.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
)

const memberSince = computed(() => {
  const d = new Date(props.broker.createdDate)
  return d.getFullYear().toString()
})

function goToDetail() {
  router.push(`/asociados/${props.broker.roleCodeName}?id=${props.broker.id}`)
}
</script>