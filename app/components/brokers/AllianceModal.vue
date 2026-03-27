<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header gradient -->
      <div class="px-6 py-5" :style="{ background: 'linear-gradient(135deg, #202d59 0%, #a31e22 100%)' }">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/40">
            <img v-if="broker.photo" :src="broker.photo" :alt="broker.fullName" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-white font-bold bg-white/20 text-lg">
              {{ initials }}
            </div>
          </div>
          <div>
            <h2 class="text-white font-bold text-lg">Solicitar Alianza</h2>
            <p class="text-blue-200 text-sm">{{ broker.fullName }}</p>
          </div>
        </div>
      </div>

      <div class="p-6 flex flex-col gap-4">
        <p class="text-gray-600 text-sm">
          Envía una solicitud de alianza a <strong>{{ broker.fullName }}</strong> (<span class="font-mono text-[#202d59]">{{ broker.roleCodeName }}</span>).
          Incluye un mensaje opcional para presentarte.
        </p>
        <textarea
          v-model="message"
          rows="3"
          placeholder="Escribe un mensaje de presentación (opcional)..."
          class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#202d59] transition"
        />
        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            @click="sendAlliance"
            class="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
            :style="{ background: 'linear-gradient(45deg, #a31e22 0%, #202d59 100%)' }"
          >
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BrokerDto, BrokerDetailDto } from '~/services/user.service'

const props = defineProps<{ broker: BrokerDto | BrokerDetailDto }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const message = ref('')

const initials = computed(() =>
  props.broker.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
)

function sendAlliance() {
  // TODO: Connect to alliance API endpoint
  console.log('Sending alliance to', props.broker.id, 'message:', message.value)
  emit('close')
}
</script>