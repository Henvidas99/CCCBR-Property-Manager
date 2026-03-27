<template>
  <div
    class="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 cursor-pointer hover:translate-y-[-4px]"
    :style="{ borderLeftColor: borderColor }"
    @click="goToDetail"
  >
    <!-- Top accent line -->
    <div class="h-1 w-full" :style="{ background: 'linear-gradient(90deg, #a31e22 0%, #202d59 100%)' }" />

    <div class="p-5 flex flex-col items-center text-center gap-3">
      <!-- Avatar -->
      <div class="relative">
        <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
          <img
            v-if="broker.photo"
            :src="broker.photo"
            :alt="broker.fullName"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
            :style="{ background: 'linear-gradient(135deg, #202d59 0%, #a31e22 100%)' }"
          >
            {{ initials }}
          </div>
        </div>
        <!-- Online indicator placeholder -->
        <span class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-gray-300" />
      </div>

      <!-- Role Code -->
      <div class="px-3 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase"
        :style="{ background: '#202d59', color: '#ffffff' }">
        {{ broker.roleCodeName }}
      </div>

      <!-- Name -->
      <div>
        <h3 class="font-bold text-gray-800 text-base leading-tight group-hover:text-[#202d59] transition">
          {{ broker.fullName }}
        </h3>
        <p class="text-xs text-gray-400 mt-0.5">{{ broker.position || 'Corredor' }}</p>
      </div>

      <!-- Stats row -->
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
        <button
          @click.stop="$emit('send-alliance', broker)"
          class="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200"
          :style="{ background: 'linear-gradient(45deg, #a31e22 0%, #202d59 100%)' }"
        >
          Enviar Alianza
        </button>
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

const props = defineProps<{ broker: BrokerDto }>()
defineEmits<{ (e: 'send-alliance', broker: BrokerDto): void }>()

const router = useRouter()

const borderColors = ['#a31e22', '#202d59', '#00cfe5', '#c3b3a2']
const borderColor = computed(() => borderColors[props.broker.id % borderColors.length])

const initials = computed(() =>
  props.broker.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
)

const genderLabel = computed(() => {
  const g = props.broker.gender?.toLowerCase()
  if (g === 'm' || g === 'male' || g === 'masculino') return 'Hombre'
  if (g === 'f' || g === 'female' || g === 'femenino') return 'Mujer'
  return props.broker.gender || '—'
})

const memberSince = computed(() => {
  const d = new Date(props.broker.createdDate)
  return d.getFullYear().toString()
})

function goToDetail() {
  router.push(`/asociados/${props.broker.roleCodeName}?id=${props.broker.id}`)
}
</script>